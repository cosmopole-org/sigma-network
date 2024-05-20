package modules

type App struct {
	AppId       string
	Network     *Network
	Database    *Database
	Memory      *Memory
	Services    *Services
	StorageRoot string
	Federative  bool
	CoreAccess  bool
	HostToIp    map[string]string
	IpToHost    map[string]string
}

var app App

func Instance() *App {
	return &app
}
func Keep(a App) {
	app = a
}
