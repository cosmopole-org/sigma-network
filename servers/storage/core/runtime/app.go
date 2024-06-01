package runtime

import "sigma/storage/core/tools"

type App struct {
	AppId            string
	Tools            tools.ICoreTools
	Services         *Services
	StorageRoot      string
	CoreAccess       bool
	LoadCoreServices func()
}

func (app *App) GenerateControl() *Control {
	return &Control{
		AppId: app.AppId,
		StorageRoot: app.StorageRoot,
		Services: app.Services,
		Trx: app.Tools.Storage().CreateTrx(),
	}
}
