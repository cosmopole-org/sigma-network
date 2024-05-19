package shell_controller

import (
	"sigma/main/core/modules"
	service_manager "sigma/main/shell/manager"
)

func AddEndpoint[T modules.IDto, V any](m *modules.Method[T, V]) {
	if modules.Instance().CoreAccess {
		service_manager.AddEndpoint[T, V](m.Key, m.Callback, m.Check, m.MethodOptions)
	}
}
