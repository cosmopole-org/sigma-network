package service_manager

import (
	"sigma/main/core/modules"
	shell_grpc "sigma/main/shell/network/grpc"
	shell_websocket "sigma/main/shell/network/websocket"
)

func AddEndpoint[T modules.IDto, V modules.IDto](m *modules.Method[T, V]) {
	modules.AddMethod(m)
	if m.MethodOptions.AsEndpoint {
		modules.AddEndpoint(m)
		shell_websocket.AddEndpoint(m)
		shell_grpc.AddEndpoint(m)
	}
}
