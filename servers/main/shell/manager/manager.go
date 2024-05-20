package manager

import (
	"sigma/main/core/modules"
	shell_keeper "sigma/main/shell/keeper"
)

type Manager struct {}

func (m *Manager) Endpoint(action *modules.Action) {
	modules.Instance().Services.AddAction(action)
	shell_keeper.Instance.SwitchNetAccess(action.Key, true, action.Access.ActionType, true, false, nil, false)
}

var Instance *Manager
