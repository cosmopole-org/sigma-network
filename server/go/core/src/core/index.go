package core

import (
	"fmt"
	"sigma/core/src/core/holder"
	"sigma/core/src/database"
	"sigma/core/src/interfaces"
	"sigma/core/src/memory"
	"sigma/core/src/network"
	"sigma/core/src/services"
)

type App struct {
	appId       string
	services    map[string]interfaces.IService
	network     interfaces.INetwork
	database    interfaces.IDatabase
	memory      interfaces.IMemory
	storageRoot string
}

func (a *App) AddService(s interfaces.IService) {
	a.services[s.GetKey()] = s
}
func (a *App) GetService(key string) interfaces.IService {
	return a.services[key]
}
func (a *App) GetDatabase() interfaces.IDatabase {
	return a.database
}
func (a *App) GetMemory() interfaces.IMemory {
	return a.memory
}
func (a *App) GetNetwork() interfaces.INetwork {
	return a.network
}
func (a *App) SetDatabase(database interfaces.IDatabase) {
	a.database = database
}
func (a *App) SetMemory(memory interfaces.IMemory) {
	a.memory = memory
}
func (a *App) SetNetwork(network interfaces.INetwork) {
	a.network = network
}
func (a *App) GetStorageRoot() string {
	return a.storageRoot
}
func (a *App) LoadServices() {
	a.services["sigma.HumanService"] = services.CreateHumanService(holder.Instance())
	a.services["towers"] = services.CreateTowerService(holder.Instance())
	a.services["rooms"] = services.CreateRoomService(holder.Instance())
	a.services["invites"] = services.CreateInviteService(holder.Instance())
	a.services["machines"] = services.CreateMachineService(holder.Instance())
	a.services["workers"] = services.CreateWorkerService(holder.Instance())
	a.services["storage"] = services.CreateStorageService(holder.Instance())
}

func CreateApp(appId string, databaseUri string, redisUri string, storageRoot string) interfaces.IApp {
	fmt.Println("Creating app...")
	var app interfaces.IApp = &App{
		appId: appId,
		storageRoot: storageRoot,
		services: map[string]interfaces.IService{},
	}
	holder.PutApp(app)
	app.SetDatabase(database.CreateDatabase(databaseUri))
	app.SetMemory(memory.CreateMemory(redisUri))
	app.SetNetwork(network.CreateNetwork())
	app.LoadServices()
	return app
}
