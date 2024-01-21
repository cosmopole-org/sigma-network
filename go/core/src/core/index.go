package core

import (
	"fmt"
	"sigma/core/src/controllers"
	"sigma/core/src/core/apps"
	"sigma/core/src/database"
	"sigma/core/src/interfaces"
	"sigma/core/src/network"
	"sigma/core/src/services"
)

type App struct {
	appId       string
	services    map[string]interfaces.IService
	controllers map[string]interfaces.IController
	network     network.Network
	database    database.Database
}

func (a App) AddService(s interfaces.IService) {
	a.services[s.GetKey()] = s
}
func (a App) GetService(key string) interfaces.IService {
	return a.services[key]
}
func (a App) AddController(c interfaces.IController) {
	a.controllers[c.GetKey()] = c
}
func (a App) GetController(key string) interfaces.IController {
	return a.controllers[key]
}
func (a App) GetDatabase() interfaces.IDatabase {
	return a.database
}
func (a App) GetNetwork() interfaces.INetwork {
	return a.network
}
func (a App) Listen(restPort int, socketPort int) {
	a.network.Listen(restPort, socketPort)
}
func (a App) LoadServices() {
	a.services["humans"] = services.CreateHumanService(apps.GetApp())
	a.services["towers"] = services.CreateTowerService(apps.GetApp())
	a.services["rooms"] = services.CreateRoomService(apps.GetApp())
	a.services["invites"] = services.CreateInviteService(apps.GetApp())
	a.services["machines"] = services.CreateMachineService(apps.GetApp())
}

func (a App) CreateControllers() {
	a.controllers["humans"] = controllers.CreateHumanController(apps.GetApp())
	a.controllers["towers"] = controllers.CreateTowerController(apps.GetApp())
	a.controllers["rooms"] = controllers.CreateRoomController(apps.GetApp())
	a.controllers["invites"] = controllers.CreateInviteController(apps.GetApp())
	a.controllers["machines"] = controllers.CreateMachineController(apps.GetApp())
}

func CreateApp(appId string, databaseUri string) *App {
	app := &App{}
	app.appId = appId
	apps.PutApp(app)
	fmt.Println("Creating app...")
	app.services = map[string]interfaces.IService{}
	app.controllers = map[string]interfaces.IController{}
	app.database = database.CreateDatabase(databaseUri)
	app.network = network.CreateNetwork()
	app.LoadServices()
	app.CreateControllers()
	return app
}
