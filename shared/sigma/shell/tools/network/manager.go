package network_manager

import (
	"sigma/main/core/runtime"
	shell_federation "sigma/main/shell/network/federation"
	shell_grpc "sigma/main/shell/network/grpc"
	shell_http "sigma/main/shell/network/http"
	shell_pusher "sigma/main/shell/network/push"
	base_manager "sigma/main/shell/tools/base"
)

type NetManager struct {
	base_manager.BaseManager
	HttpServer   *shell_http.HttpServer
	PusherServer *shell_pusher.PusherServer
	GrpcServer   *shell_grpc.GrpcServer
	FedNet       *shell_federation.FedNet
	listenPool   map[string]func(int)
}

func (nm *NetManager) SwitchNetAccess(key string, http bool, pusher bool, grpc bool, converter func(interface{}) (any, error)) {
	if http {
		nm.HttpServer.Enablendpoint(key)
	}
	if pusher {
		nm.PusherServer.EnableEndpoint(key)
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
		nm.PusherServer.EnableEndpoint(action.Key)
	}
	if action.Access.Grpc {
		nm.GrpcServer.EnableEndpoint(action.Key, converter)
	}
}

func New(sc *layer1_app.App, maxReqSize int, ip2host map[string]string, host2ip map[string]string, fed *shell_federation.FedNet) *NetManager {
	nm := &NetManager{}
	nm.App = sc
	nm.FedNet = fed
	nm.HttpServer = shell_http.New(sc, maxReqSize)
	nm.PusherServer = shell_pusher.New(sc)
	nm.GrpcServer = shell_grpc.New(sc)
	nm.FedNet.LoadFedNet(nm.HttpServer.Server)
	nm.listenPool = map[string]func(int){
		"http": nm.HttpServer.Listen,
		"grpc": nm.GrpcServer.Listen,
		"push": nm.PusherServer.Listen,
	}
	return nm
}
