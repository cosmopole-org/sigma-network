package tool_net

import (
	"sigma/sigma/abstract"
	modulelogger "sigma/sigma/core/module/logger"
	"sigma/sigma/layer1/adapters"
	"sigma/sigma/layer1/tools/signaler"
	netgrpc "sigma/sigma/layer3/tools/network/grpc"
	nethttp "sigma/sigma/layer3/tools/network/http"
	netpusher "sigma/sigma/layer3/tools/network/push"
)

type Network struct {
	Http *nethttp.HttpServer
	Push *netpusher.PusherServer
	Grpc *netgrpc.GrpcServer
	Fed  adapters.IFederation
}

func NewNetwork(
	core abstract.ICore,
	logger *modulelogger.Logger,
	cache adapters.ICache,
	signaler *signaler.Signaler) *Network {
	net := &Network{
		Http: nethttp.New(core, logger, 0),
		Push: netpusher.New(core, logger, cache, signaler),
		Grpc: netgrpc.New(core, logger),
	}
	return net
}
