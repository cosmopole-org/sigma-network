package runtime

import "sigma/admin/core/managers"

type App struct {
	AppId            string
	Managers         managers.ICoreManagers
	Services         *Services
	StorageRoot      string
	CoreAccess       bool
	GenControl       func() *Control
	LoadCoreServices func()
}
