package service_manager

import (
	"sigma/main/core/modules"
	shell_http "sigma/main/shell/network/http"
	shell_grpc "sigma/main/shell/network/grpc"
	shell_websocket "sigma/main/shell/network/websocket"
	shell_federation "sigma/main/shell/network/federation"
)

func AddEndpoint[T modules.IDto, V any](key string, callback func(*modules.App, T, modules.Assistant) (any, error), ck modules.Check, ao modules.AccessOptions) {
	m := &modules.Method[T, V]{Key: key, Callback: callback, Check: ck, MethodOptions: ao}
	modules.AddMethod[T, V](key, callback, ck, ao)
	if ao.Http {
		shell_http.AddEndpoint(m)
	}
	if ao.Ws {
		shell_websocket.AddEndpoint(m)
	}
	if ao.Grpc {
		shell_grpc.AddEndpoint(m)
	}
}

func CallEndpoint[T modules.IDto, V any](key string, dto T, meta *modules.Meta) (any, error) {
	return modules.CallMethod[T, V](key, dto, meta)
}

func GetMethod(key string) *modules.Method[modules.IDto, any] {
	return modules.Methods[key].(*modules.Method[modules.IDto, any])
}

func Load(app *modules.App) (*shell_http.HttpServer, *shell_federation.FedNet, *shell_websocket.WsServer, *shell_grpc.GrpcServer) {
	fn := shell_federation.New()
	hs := shell_http.New(fn.SendInFederation)
	ws := shell_websocket.New(app, hs)
	gc := shell_grpc.New()
	fn.LoadFedNet(app, hs)
	return hs, fn, ws, gc
}
