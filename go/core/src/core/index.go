package core

import (
	"fmt"
	"sigma/core/src/core/apps"
	"sigma/core/src/database"
	"sigma/core/src/interfaces"
	"sigma/core/src/network"
	"sigma/core/src/services"
)

type App struct {
	appId    string
	services map[string]interfaces.IService
	network  network.Network
	database database.Database
}

func (a App) AddService(s interfaces.IService) {
	a.services[s.GetKey()] = s
}
func (a App) GetService(key string) interfaces.IService {
	return a.services[key]
}
func (a App) GetDatabase() interfaces.IDatabase {
	return a.database
}
func (a App) GetNetwork() interfaces.INetwork {
	return a.network
}
func (a App) Listen(port int) {
	fmt.Println(fmt.Sprintf("Listening to port %d ...", port))
	a.network.Listen(port)
}
func (a App) LoadServices() {
	a.services["humans"] = services.CreateHumanService(apps.GetApp())
	a.services["towers"] = services.CreateTowerService(apps.GetApp())
	a.services["rooms"] = services.CreateRoomService(apps.GetApp())
}

func CreateApp(appId string) *App {
	app := &App{}
	app.appId = appId
	apps.PutApp(app)
	fmt.Println("Creating app...")
	app.services = map[string]interfaces.IService{}
	app.database = database.CreateDatabase("postgresql://root:OadaAkhwtDfWLD7t9WGUYqbL@sinai.liara.cloud:33721/postgres")
	app.network = network.CreateNetwork()
	app.LoadServices()
	return app
}
