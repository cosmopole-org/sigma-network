package modules

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net"
	"sigma/main/core/utils"
	"strings"

	"github.com/mitchellh/mapstructure"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"

	"google.golang.org/grpc/status"
)

func HandleFederationOrNot(action string, c Check, md metadata.MD, mo MethodOptions, fn func(*App, interface{}, Assistant) (any, error), f interface{}, assistant Assistant) (any, error) {
	if mo.InFederation {
		originHeader, ok := md["origin"]
		if !ok {
			return nil, status.Errorf(codes.Unauthenticated, "Origin is not supplied")
		}
		origin := originHeader[0]
		if origin == Instance().AppId {
			result, err := fn(Instance(), f, assistant)
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
			Instance().Memory.SendInFederation(origin, InterfedPacket{IsResponse: false, Key: action, UserId: assistant.UserId, TowerId: assistant.TowerId, RoomId: assistant.RoomId, Data: string(data), RequestId: reqId})
			return ResponseSimpleMessage{Message: "request to federation queued successfully"}, nil
		}
	} else {
		result, err := fn(Instance(), f, assistant)
		if err != nil {
			return nil, status.Errorf(codes.Unauthenticated, err.Error())
		}
		return result, nil
	}
}

func serverInterceptor(
	app *App,
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
	fn := Handlers[action]
	f := Frames[action]
	c := Checks[action]
	mo := MethodOptionsMap[action]
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
		var userId, userType = AuthWithToken(app, token)
		var creature = ""
		if userType == 1 {
			creature = "human"
		} else if userType == 2 {
			creature = "machine"
		}
		if userId > 0 {
			if c.Tower {
				location := HandleLocationWithProcessed(app, token, userId, creature, f.(IDto).GetTowerId(), f.(IDto).GetRoomId(), 0)
				if location.TowerId > 0 {
					return HandleFederationOrNot(action, c, md, mo, fn, f, CreateAssistant(userId, creature, location.TowerId, location.RoomId, userId, nil))
				} else {
					return nil, status.Errorf(codes.Unauthenticated, "Access denied")
				}
			} else {
				return HandleFederationOrNot(action, c, md, mo, fn, f, CreateAssistant(userId, creature, 0, 0, 0, nil))
			}
		} else {
			return nil, status.Errorf(codes.Unauthenticated, "Authenticatio failed")
		}
	} else {
		h, err := HandleFederationOrNot(action, c, md, mo, fn, f, CreateAssistant(0, "", 0, 0, 0, nil))
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
				Instance(),
				ctx,
				req,
				info,
			)
		},
	)
}

func LoadGrpcServer() *grpc.Server {
	grpcServer := grpc.NewServer(
		withServerUnaryInterceptor(),
	)
	return grpcServer
}

func ListenForGrpc(grpcServer *grpc.Server, port int) {
	lis, err := net.Listen("tcp", fmt.Sprintf(":%d", port))
	if err != nil {
		log.Fatalf("failed to listen grpc: %v", err)
	}
	log.Printf("server listening at %v", lis.Addr())
	if err := grpcServer.Serve(lis); err != nil {
		log.Fatalf("failed to serve grpc: %v", err)
	}
}
