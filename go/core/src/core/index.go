package core

import (
	"fmt"
	"sigma/core/src/core/apps"
	"sigma/core/src/database"
	"sigma/core/src/interfaces"
	"sigma/core/src/memory"
	"sigma/core/src/network"
	"sigma/core/src/services"
)

type App struct {
	appId       string
	services    map[string]interfaces.IService
	network     *network.Network
	database    database.Database
	memory      *memory.Memory
	storageRoot string
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
func (a App) GetMemory() interfaces.IMemory {
	return a.memory
}
func (a App) GetNetwork() interfaces.INetwork {
	return a.network
}
func (a App) GetStorageRoot() string {
	return a.storageRoot
}
func (a App) Listen(port int) {
	a.network.Listen(port)
}
func (a App) LoadServices() {
	a.services["humans"] = services.CreateHumanService(apps.GetApp())
	a.services["towers"] = services.CreateTowerService(apps.GetApp())
	a.services["rooms"] = services.CreateRoomService(apps.GetApp())
	a.services["invites"] = services.CreateInviteService(apps.GetApp())
	a.services["machines"] = services.CreateMachineService(apps.GetApp())
	a.services["workers"] = services.CreateWorkerService(apps.GetApp())
	a.services["storage"] = services.CreateStorageService(apps.GetApp())
}

func CreateApp(appId string, databaseUri string, redisUri string, storageRoot string) *App {
	app := &App{}
	app.appId = appId
	apps.PutApp(app)
	fmt.Println("Creating app...")
	app.storageRoot = storageRoot
	app.services = map[string]interfaces.IService{}
	app.database = database.CreateDatabase(databaseUri)
	app.memory = memory.CreateMemory(redisUri)
	app.network = network.CreateNetwork()
	app.LoadServices()
	return app
}
