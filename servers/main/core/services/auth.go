package services

import (
	dtos_auth "sigma/main/core/dtos/auth"
	"sigma/main/core/modules"
	"sigma/main/shell/manager"
	network_store "sigma/main/shell/network"
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
	manager.Instance.Endpoint(modules.CreateAction(
		"/auths/getServerPublicKey",
		fiber.MethodGet,
		modules.CreateCk(false, false, false),
		modules.CreateAc(coreAccess, true, false, false),
		true,
		getServerPublicKey,
	))
	manager.Instance.Endpoint(modules.CreateAction(
		"/auths/getServersMap",
		fiber.MethodGet,
		modules.CreateCk(false, false, false),
		modules.CreateAc(coreAccess, true, false, false),
		true,
		getServersMap,
	))
}

func LoadAuthGrpcService(grpcServer *grpc.Server) {
	type server struct {
		pb.UnimplementedAuthServiceServer
	}
	pb.RegisterAuthServiceServer(grpcServer, &server{})
}