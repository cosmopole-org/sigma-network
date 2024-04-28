package core

import (
	"fmt"
	"sigma/map/core/core/holder"
	"sigma/map/core/database"
	"sigma/map/core/interfaces"
	"sigma/map/core/memory"
	"sigma/map/core/network"
	"sigma/map/core/services"
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
	a.services["map"] = services.CreateMapService(a)
}

func CreateApp(appId string, databaseUri string, redisUri string, storageRoot string) interfaces.IApp {
	fmt.Println("Creating app...")
	var app interfaces.IApp = &App{
		appId:       appId,
		storageRoot: storageRoot,
		services:    map[string]interfaces.IService{},
	}
	holder.PutApp(app)
	app.SetDatabase(database.CreateDatabase(databaseUri))
	app.SetMemory(memory.CreateMemory(redisUri))
	app.SetNetwork(network.CreateNetwork())
	app.LoadServices()
	return app
}
