package runtime

import "sigma/main/core/managers"

type App struct {
	AppId            string
	Managers         managers.ICoreManagers
	Services         *Services
	StorageRoot      string
	CoreAccess       bool
	GenControl       func() *Control
	LoadCoreServices func()
}
