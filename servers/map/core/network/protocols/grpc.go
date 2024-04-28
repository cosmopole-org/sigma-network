package sigma_network_protocols

import (
	"context"
	"fmt"
	"log"
	"net"
	"sigma/map/core/core/holder"
	sigma_network_security "sigma/map/core/network/security"
	"sigma/map/core/types"
	"strings"

	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"
)

func serverInterceptor(ctx context.Context,
	req interface{},
	info *grpc.UnaryServerInfo,
	handler grpc.UnaryHandler) (interface{}, error) {
	fmt.Println(info.FullMethod)
	parts := strings.Split(info.FullMethod, "/")
	if len(parts) == 3 {
		service := holder.Instance().GetService(parts[1])
		if service != nil {
			var method = service.GetMethod(parts[2])
			if method != nil && method.MethodOptions().AsEndpoint() {
				if method.GetCheck().NeedUser() {
					md, ok := metadata.FromIncomingContext(ctx)
					if !ok {
						return nil, status.Errorf(codes.InvalidArgument, "Retrieving metadata is failed")
					}
					tokenHeader, ok := md["token"]
					if !ok {
						return nil, status.Errorf(codes.Unauthenticated, "Authorization token is not supplied")
					}
					token := tokenHeader[0]
					var userId, _ = sigma_network_security.AuthWithToken(holder.Instance(), token)
					if userId > 0 {
						h, err := method.GetCallback()(holder.Instance(), req, types.CreateAssistant(userId, "human", 0, 0, 0, nil))
						return h, err
					}
				} else {
					h, err := method.GetCallback()(holder.Instance(), req, types.CreateAssistant(0, "", 0, 0, 0, nil))
					return h, err
				}
			}
		}
	}
	return nil, status.Errorf(codes.NotFound, "Endpoint not found")
}

func withServerUnaryInterceptor() grpc.ServerOption {
	return grpc.UnaryInterceptor(serverInterceptor)
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
