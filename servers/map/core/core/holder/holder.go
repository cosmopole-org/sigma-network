package holder

import "sigma/map/core/interfaces"

var app interfaces.IApp

func PutApp(a interfaces.IApp) {
	app = a
}

func Instance() interfaces.IApp {
	return app
}
