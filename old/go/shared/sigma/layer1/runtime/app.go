package core

import (
	"sigma/main/layer1/models"
	"sigma/main/layer1/security"
	"sigma/main/layer1/signaler"
)

type Core struct {
	AppId     string
	OpenToNet bool
	services  *Services
	signaler  *signaler.Signaler
	security  *security.Security
	Layers    []models.ISigmaLayer
}

func (core *Core) PushLayer(l models.ISigmaLayer) {
	core.Layers = append(core.Layers, l)
}

func (app *Core) Services() *Services {
	return app.services
}

func (app *Core) PutServices(ss *Services) {
	app.services = ss
}

func (app *Core) PutSignaler(ss *signaler.Signaler) {
	app.signaler = ss
}

func (app *Core) PutSecurity(ss *security.Security) {
	app.security = ss
}

func (app *Core) Signaler() *signaler.Signaler {
	return app.signaler
}

func (app *Core) Security() *security.Security {
	return app.security
}
