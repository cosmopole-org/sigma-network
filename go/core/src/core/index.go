package core

import (
	"fmt"
	"sigma/core/src/database"
	"sigma/core/src/network"
	"sigma/core/src/types"
)

var apps = map[string]*App{}

type App struct {
	appId string
	services map[string]*types.Service
	network *network.Network
	database *database.Database
}
func (a App) AddService(s *types.Service) {
	a.services[s.GetKey()] = s
}
func (a App) GetService(key string) *types.Service {
	return a.services[key]
}
func (a App) Listen(port int) {
	fmt.Println(fmt.Sprintf("Listening to port %d ...", port))
	a.network.Listen(port)
}

func CreateApp(appId string) *App {
	app := new(App)
	app.appId = appId
	apps[appId] = app
	fmt.Println("Creating app...")
	app.services = map[string]*types.Service{}
	app.database = database.CreateDatabase("postgresql://root:OadaAkhwtDfWLD7t9WGUYqbL@sinai.liara.cloud:33721/postgres")
	app.network = network.CreateNetwork(app)
	return app
}
