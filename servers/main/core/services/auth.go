package services

import (
	"sigma/main/core/types"

	pb "sigma/main/core/grpc"
)

func getServerPublicKey(app *types.App, dto interface{}, assistant types.Assistant) (any, error) {
	return &pb.AuthGetServerPublicKeyOutput{PublicKey: string(types.FetchKeyPair("server_key")[1])}, nil
}

func CreateAuthService(app *types.App) *types.Service {

	var s = types.CreateService(app, "sigma.AuthService")
	s.AddGrpcLoader(func() {
		type server struct {
			pb.UnimplementedAuthServiceServer
		}
		pb.RegisterAuthServiceServer(app.Network.GrpcServer, &server{})
	})
	s.AddMethod(types.CreateMethod("getServerPublicKey", getServerPublicKey, types.CreateCheck(false, false, false), pb.AuthGetServerPublicKeyDto{}, types.CreateMethodOptions(true, true)))
	return s
}
