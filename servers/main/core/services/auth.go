package services

import (
	"sigma/main/core/modules"

	pb "sigma/main/core/grpc"
)

func getServerPublicKey(app *modules.App, dto interface{}, assistant modules.Assistant) (any, error) {
	return &pb.AuthGetServerPublicKeyOutput{PublicKey: string(modules.FetchKeyPair("server_key")[1])}, nil
}

func CreateAuthService(app *modules.App) *modules.Service {

	var s = modules.CreateService(app, "sigma.AuthService")
	s.AddGrpcLoader(func() {
		type server struct {
			pb.UnimplementedAuthServiceServer
		}
		pb.RegisterAuthServiceServer(app.Network.GrpcServer, &server{})
	})
	s.AddMethod(modules.CreateMethod("getServerPublicKey", getServerPublicKey, modules.CreateCheck(false, false, false), pb.AuthGetServerPublicKeyDto{}, modules.CreateMethodOptions(true, true)))
	return s
}
