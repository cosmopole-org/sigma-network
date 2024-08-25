package tool_net

import (
	"sigma/sigma/abstract"
	modulelogger "sigma/sigma/core/module/logger"
	"sigma/sigma/layer1/adapters"
	"sigma/sigma/layer1/tools/security"
	"sigma/sigma/layer1/tools/signaler"
	netgrpc "sigma/sigma/layer3/tools/network/grpc"
	nethttp "sigma/sigma/layer3/tools/network/http"
	//netpusher "sigma/sigma/layer3/tools/network/push"
	netws "sigma/sigma/layer3/tools/network/ws"
)

type Network struct {
	Http *nethttp.HttpServer
	//Push *netpusher.PusherServer
	Grpc *netgrpc.GrpcServer
	Ws   *netws.WsServer
	Fed  adapters.IFederation
}

func NewNetwork(
	core abstract.ICore,
	logger *modulelogger.Logger,
	storage adapters.IStorage,
	cache adapters.ICache,
	security *security.Security,
	signaler *signaler.Signaler) *Network {
    hs := nethttp.New(core, logger, 0)
	net := &Network{
		Http: hs,
		Ws: netws.New(core, hs, security, signaler, storage),
		//Push: netpusher.New(core, logger, storage, cache, signaler),
		Grpc: netgrpc.New(core, logger),
	}
	return net
}

func (net *Network) Run(ports map[string]int) {
	httpPort, ok := ports["http"]
	if ok {
		net.Http.Listen(httpPort)
	}
	// pushPort, ok2 := ports["push"]
	// if ok2 {
	// 	net.Push.Listen(pushPort)
	// }
	grpcPort, ok3 := ports["grpc"]
	if ok3 {
		net.Grpc.Listen(grpcPort)
	}
}
