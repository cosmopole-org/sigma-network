package apps

import "sigma/core/src/interfaces"

var app *interfaces.IApp

func PutApp(a interfaces.IApp) {
	app = &a
}

func GetApp() *interfaces.IApp {
	return app
}
