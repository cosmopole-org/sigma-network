package services

import (
	inputs_auth "sigma/main/core/inputs/auth"
	"sigma/main/core/models"
	outputs_auth "sigma/main/core/outputs/auth"
	"sigma/main/core/runtime"
	network_store "sigma/main/shell/network"

	"github.com/gofiber/fiber/v2"
	"google.golang.org/grpc"
)

func getServerPublicKey(app *runtime.App, input inputs_auth.GetServerKeyInput, info models.Info) (any, error) {
	return &outputs_auth.GetServerKeyOutput{PublicKey: string(app.Managers.CryptoManager().FetchKeyPair("server_key")[1])}, nil
}

func getServersMap(app *runtime.App, input inputs_auth.GetServersMapInput, info models.Info) (any, error) {
	return outputs_auth.GetServersMapOutput{
		Servers: network_store.WellKnownServers,
	}, nil
}

func CreateAuthService(app *runtime.App, coreAccess bool) {
	app.Services.AddAction(runtime.CreateAction(
		app,
		"/auths/getServerPublicKey",
		runtime.CreateCk(false, false, false),
		runtime.CreateAc(coreAccess, true, false, false, fiber.MethodGet),
		true,
		getServerPublicKey,
	))
	app.Services.AddAction(runtime.CreateAction(
		app,
		"/auths/getServersMap",
		runtime.CreateCk(false, false, false),
		runtime.CreateAc(coreAccess, true, false, false, fiber.MethodGet),
		true,
		getServersMap,
	))
}

func LoadAuthGrpcService(grpcServer *grpc.Server) {
	// type server struct {
	// 	pb.UnimplementedAuthServiceServer
	// }
	// pb.RegisterAuthServiceServer(grpcServer, &server{})
}
