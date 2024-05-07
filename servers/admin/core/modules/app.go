package modules

import pb "sigma/admin/shell/grpc"

type App struct {
	AppId       string
	Network     *Network
	Database    *Database
	Memory      *Memory
	Security    *Security
	StorageRoot string
	Federation  map[string]pb.Server
}

var app App

func Instance() *App {
	return &app
}
func Keep(a App) {
	app = a
}

