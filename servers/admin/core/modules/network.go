package modules

import (
	"fmt"
	"sigma/admin/core/utils"

	"google.golang.org/grpc"
)

type Network struct {
	GrpcServer   *grpc.Server
	PusherServer *Pusher
}

func CreateListenOptions(https bool, httpsPort int, grpc bool, grpcPort int) ListenOptions {
	return ListenOptions{https, httpsPort, grpc, grpcPort}
}

func (n *Network) Listen(options ListenOptions) {
	if options.Https {
		ListenForHttps(Instance(), options.HttpsPort)
	}
	if options.Grpc {
		ListenForGrpc(n.GrpcServer, options.GrpcPort)
	}
}

func CreateNetwork() *Network {
	fmt.Println("running network...")
	netInstance := &Network{}
	utils.LoadValidationSystem()
	netInstance.GrpcServer = LoadGrpcServer()
	netInstance.PusherServer = LoadPusher()
	return netInstance
}
