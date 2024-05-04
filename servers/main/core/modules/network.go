package modules

import (
	"fmt"
	"sigma/main/core/utils"

	"google.golang.org/grpc"
)

type Network struct {
	GrpcServer   *grpc.Server
	PusherServer *Pusher
	RestServer   *HttpServer
}

func CreateListenOptions(https bool, httpsPort int, grpc bool, grpcPort int) ListenOptions {
	return ListenOptions{https, httpsPort, grpc, grpcPort}
}

func (n *Network) Listen(options ListenOptions) {
	if options.Https {
		n.RestServer.ListenForHttps(Instance(), options.HttpsPort)
		n.PusherServer.LoadWebsocket(Instance())
	}
	if options.Grpc {
		ListenForGrpc(n.GrpcServer, options.GrpcPort)
	}
}

func CreateNetwork() *Network {
	fmt.Println("running network...")
	netInstance := &Network{}
	utils.LoadValidationSystem()
	netInstance.RestServer = LoadHttpServer()
	netInstance.GrpcServer = LoadGrpcServer()
	netInstance.PusherServer = LoadPusher()
	return netInstance
}
