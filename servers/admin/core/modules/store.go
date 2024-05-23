package modules

var app *App

func GetApp() *App {
	return app
}
func PutApp(a *App) {
	app = a
}
