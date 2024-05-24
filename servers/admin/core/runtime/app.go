package runtime

import "sigma/admin/core/managers"

type App struct {
	AppId       string
	Managers    *managers.Managers
	Services    *Services
	StorageRoot string
	CoreAccess  bool
}
