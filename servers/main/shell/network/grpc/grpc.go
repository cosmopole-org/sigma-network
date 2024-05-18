package shell_grpc

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net"
	"sigma/main/core/modules"
	"sigma/main/core/utils"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/mitchellh/mapstructure"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"

	"google.golang.org/grpc/status"
)

type GrpcServer struct {
	Server *grpc.Server
}

var endpoints = map[string]func(interface{}, string, string, string) (any, string, error){}

func AddEndpoint[T modules.IDto, V any](m *modules.Method[T, V]) {
	endpoints[m.Key] = func(rawBody interface{}, token string, origin string, requestId string) (any, string, error) {
		body := new(T)
		err := mapstructure.Decode(rawBody, body)
		if err != nil {
			return nil, "error", errors.New("invalid input format")
		}
		var f = *body
		statusCode, res := modules.ProcessData[T, V](origin, token, f, requestId, m, nil)
		if statusCode != fiber.StatusOK {
			return nil, "error", errors.New(res.(utils.Error).Message)
		}
		if (m.MethodOptions.InFederation) && (origin != modules.Instance().AppId) {
			return res, "noaction", nil
		}
		return res, "response", nil
	}
}

func serverInterceptor(
	ctx context.Context,
	req interface{},
	info *grpc.UnaryServerInfo,
	_ grpc.UnaryHandler,
) (interface{}, error) {
	fullMethod := info.FullMethod
	keyArr := strings.Split(fullMethod, "/")
	if len(keyArr) != 3 {
		return nil, status.Errorf(codes.InvalidArgument, "Wrong path format")
	}
	fmArr := strings.Split(keyArr[1], ".")
	if len(fmArr) != 2 {
		return nil, status.Errorf(codes.InvalidArgument, "Wrong path format")
	}
	action := "/" + strings.ToLower(fmArr[1][0:len(fmArr[1])-len("Service")]) + "s" + "/" + keyArr[2]
	md, ok := metadata.FromIncomingContext(ctx)
	if !ok {
		return nil, status.Errorf(codes.Unauthenticated, "Metadata not provided")
	}
	tokenHeader, ok := md["token"]
	if !ok {
		return nil, status.Errorf(codes.Unauthenticated, "Authorization token is not supplied")
	}
	token := tokenHeader[0]
	originHeader, ok := md["origin"]
	if !ok {
		return nil, status.Errorf(codes.Unauthenticated, "Origin is not supplied")
	}
	origin := originHeader[0]
	reqIdHeader, ok := md["requestId"]
	if !ok {
		return nil, status.Errorf(codes.Unauthenticated, "RequestId is not supplied")
	}
	requestId := reqIdHeader[0]
	endpoint := endpoints[action]
	res, _, err := endpoint(req, token, origin, requestId)
	if err != nil {
		return nil, status.Errorf(codes.Unauthenticated, err.Error())
	} else {
		return res, nil
	}
}

func (g *GrpcServer) ListenForGrpc(port int) {
	lis, err := net.Listen("tcp", fmt.Sprintf(":%d", port))
	if err != nil {
		log.Fatalf("failed to listen grpc: %v", err)
	}
	log.Printf("server listening at %v", lis.Addr())
	go g.Server.Serve(lis)
}

func LoadGrpcServer() *GrpcServer {
	grpcServer := grpc.NewServer(
		grpc.UnaryInterceptor(serverInterceptor),
	)
	return &GrpcServer{Server: grpcServer}
}
