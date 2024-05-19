package services

import (
	dtos_auth "sigma/main/core/dtos/auth"
	"sigma/main/core/modules"
	network_store "sigma/main/shell/network"
	shell_controller "sigma/main/shell/network/core"
	outputs_auth "sigma/main/shell/outputs/auth"

	pb "sigma/main/core/models/grpc"

	"github.com/gofiber/fiber/v2"
	"google.golang.org/grpc"
)

func getServerPublicKey(app *modules.App, dto dtos_auth.GetServerKey, assistant modules.Assistant) (any, error) {
	return &pb.AuthGetServerPublicKeyOutput{PublicKey: string(modules.FetchKeyPair("server_key")[1])}, nil
}

func getServersMap(app *modules.App, dto dtos_auth.GetServersMapDto, assistant modules.Assistant) (any, error) {
	return outputs_auth.GetServersMapOutput{
		Servers: network_store.WellKnownServers,
	}, nil
}

func CreateAuthService(app *modules.App, coreAccess bool) {
	shell_controller.AddEndpoint(
		modules.AddMethod[dtos_auth.GetServerKey, dtos_auth.GetServerKey](
			"/auths/getServerPublicKey",
			getServerPublicKey,
			modules.CreateCk(false, false, false),
			modules.CreateAc(coreAccess, fiber.MethodGet, true, false, false),
		),
	)
	shell_controller.AddEndpoint(
		modules.AddMethod[dtos_auth.GetServersMapDto, dtos_auth.GetServersMapDto](
			"/auths/getServerPublicKey",
			getServersMap,
			modules.CreateCk(false, false, false),
			modules.CreateAc(coreAccess, fiber.MethodGet, true, false, false),
		),
	)
}

func LoadAuthGrpcService(grpcServer *grpc.Server) {
	type server struct {
		pb.UnimplementedAuthServiceServer
	}
	pb.RegisterAuthServiceServer(grpcServer, &server{})
}
