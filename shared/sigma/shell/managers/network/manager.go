package network_manager

import (
	"sigma/main/core/modules"
	shell_federation "sigma/main/shell/network/federation"
	shell_grpc "sigma/main/shell/network/grpc"
	shell_http "sigma/main/shell/network/http"
	shell_websocket "sigma/main/shell/network/websocket"
)

type NetManager struct {
	HttpServer *shell_http.HttpServer
	WsServer   *shell_websocket.WsServer
	GrpcServer *shell_grpc.GrpcServer
	FedNet     *shell_federation.FedNet
}

func (nm *NetManager) SwitchNetAccess(key string, http bool, ws bool, grpc bool, converter func(interface{}) (any, error)) {
	if http {
		nm.HttpServer.Enablendpoint(key)
	}
	if ws {
		nm.WsServer.EnableEndpoint(key)
	}
	if grpc {
		nm.GrpcServer.EnableEndpoint(key, converter)
	}
}

func (nm *NetManager) SwitchNetAccessByAction(action *modules.Action, converter func(interface{}) (any, error)) {
	if action.Access.Http {
		nm.HttpServer.Enablendpoint(action.Key)
	}
	if action.Access.Ws {
		nm.WsServer.EnableEndpoint(action.Key)
	}
	if action.Access.Grpc {
		nm.GrpcServer.EnableEndpoint(action.Key, converter)
	}
}

func New(maxReqSize int) *NetManager {
	fn := shell_federation.New()
	hs := shell_http.New(maxReqSize, fn.SendInFederation)
	ws := shell_websocket.New(hs)
	gc := shell_grpc.New()
	fn.LoadFedNet(hs.Server)
	return &NetManager{
		HttpServer: hs,
		WsServer:   ws,
		GrpcServer: gc,
		FedNet:     fn,
	}
}
