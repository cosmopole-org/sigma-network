package services

import (
	dtos_auth "sigma/main/shell/dtos/auth"
	"sigma/main/core/modules"

	pb "sigma/main/shell/grpc"

	"github.com/gofiber/fiber/v2"
	"google.golang.org/grpc"
)

func getServerPublicKey(app *modules.App, dto dtos_auth.GetServerKey, assistant modules.Assistant) (any, error) {
	return &pb.AuthGetServerPublicKeyOutput{PublicKey: string(modules.FetchKeyPair("server_key")[1])}, nil
}

func CreateAuthService(app *modules.App) {
	modules.AddMethod(
		app,
		modules.CreateMethod[dtos_auth.GetServerKey, dtos_auth.GetServerKey](
			"/auths/getServerPublicKey",
			getServerPublicKey,
			dtos_auth.GetServerKey{},
			modules.CreateCheck(false, false, false),
			modules.CreateMethodOptions(true, fiber.MethodGet, true, false),
			modules.CreateInterFedOptions(true, true),
		),
	)
}

func LoadAuthGrpcService(grpcServer *grpc.Server) {
	type server struct {
		pb.UnimplementedAuthServiceServer
	}
	pb.RegisterAuthServiceServer(grpcServer, &server{})
}
