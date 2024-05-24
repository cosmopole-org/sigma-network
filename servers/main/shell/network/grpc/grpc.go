package shell_grpc

import (
	"context"
	"errors"
	"fmt"
	"net"
	"sigma/main/core/dtos"
	"sigma/main/core/runtime"
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
	app       *runtime.App
	Server    *grpc.Server
	Endpoints map[string]func(interface{}, string, string, string) (any, string, error)
}

func CreateConverter[T dtos.IDto](key string) func(interface{}) (any, error) {
	return func(i interface{}) (any, error) {
		body := new(T)
		err := mapstructure.Decode(i, body)
		if err != nil {
			return nil, errors.New("invalid input format")
		}
		return *body, nil
	}
}

func (gs *GrpcServer) EnableEndpoint(key string, converter func(interface{}) (any, error)) {
	gs.Endpoints[key] = func(rawBody interface{}, token string, origin string, requestId string) (any, string, error) {
		data, err0 := converter(rawBody)
		if err0 != nil {
			return nil, "error", err0
		}
		statusCode, res, err := gs.app.Services.CallAction(key, data, token, origin)
		if statusCode == fiber.StatusOK {
			return res, "response", nil
		} else if statusCode == -2 {
			return res, "noaction", nil
		} else if err != nil {
			return nil, "error", errors.New(res.(utils.Error).Message)
		}
		return nil, "", nil
	}
}

func (gs *GrpcServer) serverInterceptor(
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
	endpoint, ok := gs.Endpoints[action]
	if ok {
		res, _, err := endpoint(req, token, origin, requestId)
		if err != nil {
			return nil, status.Errorf(codes.Unauthenticated, err.Error())
		} else {
			return res, nil
		}
	} else {
		return nil, status.Errorf(codes.Unauthenticated, "endpoint not found")
	}
}

func (gs *GrpcServer) Listen(port int) {
	lis, err := net.Listen("tcp", fmt.Sprintf(":%d", port))
	if err != nil {
		utils.Log(5, "failed to listen grpc: %v", err)
	}
	utils.Log(5, "server listening at %v", lis.Addr())
	go gs.Server.Serve(lis)
}

func New(sc *runtime.App) *GrpcServer {
	gs := &GrpcServer{app: sc, Endpoints: make(map[string]func(interface{}, string, string, string) (any, string, error))}
	grpcServer := grpc.NewServer(
		grpc.UnaryInterceptor(gs.serverInterceptor),
	)
	gs.Server = grpcServer
	return gs
}
