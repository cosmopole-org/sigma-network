package modules

type App struct {
	AppId       string
	Network     *Network
	Database    *Database
	Memory      *Memory
	StorageRoot string
	Federative  bool
}

var app App

func Instance() *App {
	return &app
}
func Keep(a App) {
	app = a
}
