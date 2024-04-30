package types

type App struct {
	AppId       string
	Services    map[string]*Service
	Network     *Network
	Database    *Database
	Memory      *Memory
	Security    *Security
	StorageRoot string
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
