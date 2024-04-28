package network

import (
	"fmt"
	"sigma/map/core/core/holder"
	"sigma/map/core/interfaces"
	sigma_network_protocols "sigma/map/core/network/protocols"
	"sigma/map/core/utils"

	"google.golang.org/grpc"
)

type Network struct {
	grpcServer   *grpc.Server
	pusherServer interfaces.IPusher
}

type ListenOptions struct {
	https     bool
	httpsPort int
	grpc      bool
	grpcPort  int
}

func CreateListenOptions(https bool, httpsPort int, grpc bool, grpcPort int) *ListenOptions {
	return &ListenOptions{https, httpsPort, grpc, grpcPort}
}

func (o *ListenOptions) Https() bool {
	return o.https
}

func (o *ListenOptions) Grpc() bool {
	return o.grpc
}

func (o *ListenOptions) HttpsPort() int {
	return o.httpsPort
}

func (o *ListenOptions) GrpcPort() int {
	return o.grpcPort
}

func (n *Network) GetGrpcServer() *grpc.Server {
	return n.grpcServer
}

func (n *Network) GetPusherServer() interfaces.IPusher {
	return n.pusherServer
}

func (n *Network) Listen(options interfaces.IListenOptions) {
	if options.Https() {
		sigma_network_protocols.ListenForHttps(holder.Instance(), options.HttpsPort())
	}
	if options.Grpc() {
		sigma_network_protocols.ListenForGrpc(n.grpcServer, options.GrpcPort())
	}
}

func CreateNetwork() interfaces.INetwork {
	fmt.Println("running network...")
	netInstance := &Network{}
	utils.LoadValidationSystem()
	netInstance.grpcServer = sigma_network_protocols.LoadGrpcServer()
	netInstance.pusherServer = sigma_network_protocols.LoadPusher()
	return netInstance
}
