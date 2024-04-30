package types

import pb "sigma/main/core/grpc"

type App struct {
	AppId       string
	Services    map[string]*Service
	Network     *Network
	Database    *Database
	Memory      *Memory
	StorageRoot string
	Federation map[string]pb.Server
}

var app App

func Instance() *App {
	return &app
}
func Keep(a App) {
	app = a
}

func (a *App) AddService(s *Service) {
	a.Services[s.Key] = s
}
func (a *App) GetService(key string) *Service {
	return a.Services[key]
}
