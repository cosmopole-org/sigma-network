package shell_grpc

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net"
	"sigma/admin/core/modules"
	"sigma/admin/core/utils"
	"strings"

	"github.com/mitchellh/mapstructure"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"

	"google.golang.org/grpc/status"
)

type GrpcServer struct {
	Server *grpc.Server
}

func HandleFederationOrNot(action string, c modules.Check, md metadata.MD, mo modules.MethodOptions, fn func(*modules.App, interface{}, modules.Assistant) (any, error), f interface{}, assistant modules.Assistant) (any, error) {
	if mo.InFederation {
		originHeader, ok := md["origin"]
		if !ok {
			return nil, status.Errorf(codes.Unauthenticated, "Origin is not supplied")
		}
		origin := originHeader[0]
		if origin == modules.Instance().AppId {
			result, err := fn(modules.Instance(), f, assistant)
			if err != nil {
				return nil, status.Errorf(codes.Unauthenticated, (err.Error()))
			}
			return result, nil
		} else {
			data, err := json.Marshal(f)
			if err != nil {
				fmt.Println(err)
				return nil, status.Errorf(codes.Unauthenticated, err.Error())
			}
			reqId, err2 := utils.SecureUniqueString(16)
			if err2 != nil {
				return nil, status.Errorf(codes.Unauthenticated, err2.Error())
			}
			modules.Instance().Memory.SendInFederation(origin, modules.InterfedPacket{IsResponse: false, Key: action, UserId: assistant.UserId, TowerId: assistant.TowerId, RoomId: assistant.RoomId, Data: string(data), RequestId: reqId})
			return modules.ResponseSimpleMessage{Message: "request to federation queued successfully"}, nil
		}
	} else {
		result, err := fn(modules.Instance(), f, assistant)
		if err != nil {
			return nil, status.Errorf(codes.Unauthenticated, err.Error())
		}
		return result, nil
	}
}

func serverInterceptor(
	app *modules.App,
	ctx context.Context,
	req interface{},
	info *grpc.UnaryServerInfo,
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
	fn := modules.Handlers[action]
	f := modules.Frames[action]
	c := modules.Checks[action]
	mo := modules.MethodOptionsMap[action]
	err := mapstructure.Decode(req, &f)
	if err != nil {
		return nil, status.Errorf(codes.InvalidArgument, "Wrong input")
	}
	md, ok := metadata.FromIncomingContext(ctx)
	if c.User {
		if !ok {
			return nil, status.Errorf(codes.InvalidArgument, "Retrieving metadata is failed")
		}
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
				location := modules.HandleLocationWithProcessed(app, token, userId, creature, f.(modules.IDto).GetTowerId(), f.(modules.IDto).GetRoomId(), 0)
				if location.TowerId > 0 {
					return HandleFederationOrNot(action, c, md, mo, fn, f, modules.CreateAssistant(userId, creature, location.TowerId, location.RoomId, userId, nil))
				} else {
					return nil, status.Errorf(codes.Unauthenticated, "Access denied")
				}
			} else {
				return HandleFederationOrNot(action, c, md, mo, fn, f, modules.CreateAssistant(userId, creature, 0, 0, 0, nil))
			}
		} else {
			return nil, status.Errorf(codes.Unauthenticated, "Authenticatio failed")
		}
	} else {
		h, err := HandleFederationOrNot(action, c, md, mo, fn, f, modules.CreateAssistant(0, "", 0, 0, 0, nil))
		return h, err
	}
}

func withServerUnaryInterceptor() grpc.ServerOption {
	return grpc.UnaryInterceptor(
		func(
			ctx context.Context,
			req interface{},
			info *grpc.UnaryServerInfo,
			_ grpc.UnaryHandler) (interface{}, error) {
			return serverInterceptor(
				modules.Instance(),
				ctx,
				req,
				info,
			)
		},
	)
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
