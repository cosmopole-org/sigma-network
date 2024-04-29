package types

import (
	"context"
	"fmt"
	"log"
	"net"
	"strings"

	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"
)

func serverInterceptor(
	app *App,
	ctx context.Context,
	req interface{},
	info *grpc.UnaryServerInfo,
	handler grpc.UnaryHandler) (interface{}, error) {
	fmt.Println(info.FullMethod)
	parts := strings.Split(info.FullMethod, "/")
	if len(parts) == 3 {
		service := app.GetService(parts[1])
		if service != nil {
			var method = service.GetMethod(parts[2])
			if method != nil && method.MethodOptions.AsEndpoint {
				if method.Check.User {
					md, ok := metadata.FromIncomingContext(ctx)
					if !ok {
						return nil, status.Errorf(codes.InvalidArgument, "Retrieving metadata is failed")
					}
					tokenHeader, ok := md["token"]
					if !ok {
						return nil, status.Errorf(codes.Unauthenticated, "Authorization token is not supplied")
					}
					token := tokenHeader[0]
					var userId, _ = AuthWithToken(app, token)
					if userId > 0 {
						h, err := method.Callback(app, req, CreateAssistant(userId, "human", 0, 0, 0, nil))
						return h, err
					}
				} else {
					h, err := method.Callback(app, req, CreateAssistant(0, "", 0, 0, 0, nil))
					return h, err
				}
			}
		}
	}
	return nil, status.Errorf(codes.NotFound, "Endpoint not found")
}

func withServerUnaryInterceptor() grpc.ServerOption {
	return grpc.UnaryInterceptor(
		func(
			ctx context.Context,
			req interface{},
			info *grpc.UnaryServerInfo,
			handler grpc.UnaryHandler) (interface{}, error) {
				return serverInterceptor(
					Instance(),
					ctx,
					req,
					info,
					handler,
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
