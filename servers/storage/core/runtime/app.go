package runtime

import (
	"sigma/storage/core/adapters"
	"sigma/storage/core/security"
	"sigma/storage/core/signaler"
)

type App struct {
	AppId     string
	OpenToNet bool
	services  *Services
	signaler  *signaler.Signaler
	security  *security.Security
	adapters  adapters.ICoreAdapters
}

func (app *App) Services() *Services {
	return app.services
}

func (app *App) PutServices(ss *Services) {
	app.services = ss
}

func (app *App) PutAdapters(ss adapters.ICoreAdapters) {
	app.adapters = ss
}

func (app *App) PutSignaler(ss *signaler.Signaler) {
	app.signaler = ss
}

func (app *App) PutSecurity(ss *security.Security) {
	app.security = ss
}

func (app *App) Signaler() *signaler.Signaler {
	return app.signaler
}

func (app *App) Security() *security.Security {
	return app.security
}

func (app *App) Adapters() adapters.ICoreAdapters {
	return app.adapters
}

func (app *App) GenerateControl() *Control {
	return &Control{
		AppId:    app.AppId,
		Services: app.services,
		Trx:      app.adapters.Storage().CreateTrx(),
	}
}
