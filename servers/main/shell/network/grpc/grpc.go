package shell_grpc

import (
	"context"
	"encoding/json"
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

var endpoints = map[string]func(interface{}, string, string, string) (any, string, error){}

func AddEndpoint[T modules.IDto, V any](m *modules.Method[T, V]) {
	endpoints[m.Key] = func(rawBody interface{}, token string, origin string, requestId string) (any, string, error) {
		body := new(T)
		err := mapstructure.Decode(rawBody, body)
		if err != nil {
			return nil, "error", errors.New("invalid input format")
		}
		var f = *body
		statusCode, res := modules.ProcessData[T, V](origin, token, f, requestId, m)
		if statusCode != fiber.StatusOK {
			return nil, "error", errors.New(res.(utils.Error).Message)
		}
		if (m.MethodOptions.InFederation) && (origin != modules.Instance().AppId) {
			return res, "noaction", nil
		}
		return res, "response", nil
	}
}

type GrpcServer struct {
	Server *grpc.Server
}

func HandleFederationReq(app *modules.App, origin string, action string, req interface{}, md metadata.MD, requestId string) (any, error) {
	data, err0 := json.Marshal(req)
	if err0 != nil {
		log.Println(err0)
		return nil, status.Errorf(codes.Unauthenticated, err0.Error())
	}
	f := modules.Frames[action]
	c := modules.Checks[action]
	err := mapstructure.Decode(req, &f)
	if err != nil {
		return nil, status.Errorf(codes.InvalidArgument, "Wrong input")
	}
	if c.User {
		tokenHeader, ok := md["token"]
		if !ok {
			return nil, status.Errorf(codes.Unauthenticated, "Authorization token is not supplied")
		}
		token := tokenHeader[0]
		var userId, _ = modules.AuthWithToken(app, token)
		if userId > 0 {
			modules.Instance().Memory.SendInFederation(origin, modules.InterfedPacket{IsResponse: false, Key: action, UserId: userId, TowerId: f.(modules.IDto).GetTowerId(), RoomId: f.(modules.IDto).GetRoomId(), Data: string(data), RequestId: requestId})
			return modules.ResponseSimpleMessage{Message: "request to federation queued successfully"}, nil
		} else {
			return nil, status.Errorf(codes.Unauthenticated, "authentication failed")
		}
	} else {
		modules.Instance().Memory.SendInFederation(origin, modules.InterfedPacket{IsResponse: false, Key: action, UserId: 0, TowerId: 0, RoomId: 0, Data: string(data), RequestId: requestId})
		return modules.ResponseSimpleMessage{Message: "request to federation queued successfully"}, nil
	}
}

func HandleNonFederationReq(app *modules.App, action string, req interface{}, md metadata.MD) (any, error) {
	fn := modules.Handlers[action]
	f := modules.Frames[action]
	c := modules.Checks[action]
	err := mapstructure.Decode(req, &f)
	if err != nil {
		return nil, status.Errorf(codes.InvalidArgument, "Wrong input")
	}
	if c.User {
		tokenHeader, ok := md["token"]
		if !ok {
			return nil, status.Errorf(codes.Unauthenticated, "Authorization token is not supplied")
		}
		token := tokenHeader[0]
		var userId, userType = modules.AuthWithToken(app, token)
		var creature = ""
		if userType == 1 {
			creature = "human"
		} else if userType == 2 {
			creature = "machine"
		}
		if userId > 0 {
			if c.Tower {
				location := modules.HandleLocationWithProcessed(app, token, userId, creature, app.AppId, f.(modules.IDto).GetTowerId(), f.(modules.IDto).GetRoomId(), userId)
				result, err := fn(modules.Instance(), f, modules.CreateAssistant(userId, creature, location.TowerId, location.RoomId, location.WorkerId, nil))
				if err != nil {
					return nil, status.Errorf(codes.Unauthenticated, err.Error())
				}
				return result, nil
			} else {
				result, err := fn(modules.Instance(), f, modules.CreateAssistant(userId, creature, 0, 0, 0, nil))
				if err != nil {
					return nil, status.Errorf(codes.Unauthenticated, err.Error())
				}
				return result, nil
			}
		} else {
			return nil, status.Errorf(codes.Unauthenticated, "Authentication failed")
		}
	} else {
		result, err := fn(modules.Instance(), f, modules.CreateAssistant(0, "", 0, 0, 0, nil))
		if err != nil {
			return nil, status.Errorf(codes.Unauthenticated, err.Error())
		}
		return result, nil
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

func withServerUnaryInterceptor() grpc.ServerOption {
	return grpc.UnaryInterceptor(serverInterceptor)
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
		withServerUnaryInterceptor(),
	)
	return &GrpcServer{Server: grpcServer}
}
