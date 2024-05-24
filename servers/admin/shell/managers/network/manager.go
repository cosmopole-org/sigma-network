package network_manager

import (
	"sigma/admin/core/runtime"
	shell_federation "sigma/admin/shell/network/federation"
	shell_grpc "sigma/admin/shell/network/grpc"
	shell_http "sigma/admin/shell/network/http"
	shell_websocket "sigma/admin/shell/network/websocket"
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

func (nm *NetManager) SwitchNetAccessByAction(action *runtime.Action, converter func(interface{}) (any, error)) {
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

func New(sc *runtime.App, maxReqSize int, ip2host map[string]string, host2ip map[string]string, fed bool) *NetManager {
	fn := shell_federation.New(sc, ip2host, host2ip, fed)
	hs := shell_http.New(sc, maxReqSize, fn.SendInFederation)
	ws := shell_websocket.New(sc, hs)
	gc := shell_grpc.New(sc)
	fn.LoadFedNet(hs.Server)
	return &NetManager{
		HttpServer: hs,
		WsServer:   ws,
		GrpcServer: gc,
		FedNet:     fn,
	}
}
