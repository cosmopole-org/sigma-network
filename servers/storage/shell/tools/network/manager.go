package network_manager

import (
	"sigma/storage/core/runtime"
	base_manager "sigma/storage/shell/tools/base"
	shell_federation "sigma/storage/shell/network/federation"
	shell_grpc "sigma/storage/shell/network/grpc"
	shell_http "sigma/storage/shell/network/http"
	shell_websocket "sigma/storage/shell/network/websocket"
)

type NetManager struct {
	base_manager.BaseManager
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

func New(sc *runtime.App, maxReqSize int, ip2host map[string]string, host2ip map[string]string, fed *shell_federation.FedNet) *NetManager {
	nm := &NetManager{}
	nm.App = sc
	nm.FedNet = fed
	nm.HttpServer = shell_http.New(sc, maxReqSize, nm.FedNet.SendInFederation)
	nm.WsServer = shell_websocket.New(sc, nm.HttpServer)
	nm.GrpcServer = shell_grpc.New(sc)
	nm.FedNet.LoadFedNet(nm.HttpServer.Server)
	return nm
}
