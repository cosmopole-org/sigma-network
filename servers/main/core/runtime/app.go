package runtime

import "sigma/main/core/managers"

type App struct {
	AppId       string
	Managers    *managers.Managers
	Services    *Services
	StorageRoot string
	CoreAccess  bool
}
