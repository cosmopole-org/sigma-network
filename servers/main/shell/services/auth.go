package services

import (
	"sigma/main/core/modules"
	dtos_auth "sigma/main/shell/dtos/auth"
	outputs_auth "sigma/main/shell/outputs/auth"
	service_manager "sigma/main/shell/services/manager"

	pb "sigma/main/shell/grpc"

	"github.com/gofiber/fiber/v2"
	"google.golang.org/grpc"
)

func getServerPublicKey(app *modules.App, dto dtos_auth.GetServerKey, assistant modules.Assistant) (any, error) {
	return &pb.AuthGetServerPublicKeyOutput{PublicKey: string(modules.FetchKeyPair("server_key")[1])}, nil
}

func getServersMap(app *modules.App, dto dtos_auth.GetServersMapDto, assistant modules.Assistant) (any, error) {
	return outputs_auth.GetServersMapOutput{
		Servers: app.HostToIp,
	}, nil
}

func CreateAuthService(app *modules.App) {
	service_manager.AddEndpoint(
		modules.CreateMethod[dtos_auth.GetServerKey, dtos_auth.GetServerKey](
			"/auths/getServerPublicKey",
			getServerPublicKey,
			dtos_auth.GetServerKey{},
			modules.CreateCheck(false, false, false),
			modules.CreateMethodOptions(true, fiber.MethodGet, true, false),
			modules.CreateInterFedOptions(true, true),
		),
	)
	service_manager.AddEndpoint(
		modules.CreateMethod[dtos_auth.GetServersMapDto, dtos_auth.GetServersMapDto](
			"/auths/getServerPublicKey",
			getServersMap,
			dtos_auth.GetServersMapDto{},
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
