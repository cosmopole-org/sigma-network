package services

import (
	dtos_auth "sigma/admin/core/dtos/auth"
	"sigma/admin/core/modules"
	network_store "sigma/admin/shell/network"
	outputs_auth "sigma/admin/core/outputs/auth"

	pb "sigma/admin/core/models/grpc"

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
	app.Services.AddAction(modules.CreateAction(
		"/auths/getServerPublicKey",
		modules.CreateCk(false, false, false),
		modules.CreateAc(coreAccess, true, false, false, fiber.MethodGet),
		true,
		getServerPublicKey,
	))
	app.Services.AddAction(modules.CreateAction(
		"/auths/getServersMap",
		modules.CreateCk(false, false, false),
		modules.CreateAc(coreAccess, true, false, false, fiber.MethodGet),
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
