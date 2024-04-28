package core

import (
	"context"
	"fmt"
	"runtime"
	"sigma/main/core/core/holder"
	"sigma/main/core/database"
	"sigma/main/core/interfaces"
	"sigma/main/core/memory"
	"sigma/main/core/network"
	"sigma/main/core/services"
	"sigma/main/core/utils"
	"time"
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
	a.services["sigma.HumanService"] = services.CreateHumanService(a)
	a.services["humans"] = a.services["sigma.HumanService"]
	a.services["sigma.TowerService"] = services.CreateTowerService(a)
	a.services["towers"] = a.services["sigma.TowerService"]
	a.services["sigma.RoomService"] = services.CreateRoomService(a)
	a.services["rooms"] = a.services["sigma.RoomService"]
	a.services["sigma.InviteService"] = services.CreateInviteService(a)
	a.services["invites"] = a.services["sigma.InviteService"]
	a.services["sigma.MachineService"] = services.CreateMachineService(a)
	a.services["machines"] = a.services["sigma.MachineService"]
	a.services["sigma.WorkerService"] = services.CreateWorkerService(a)
	a.services["workers"] = a.services["sigma.WorkerService"]
	a.services["storage"] = services.CreateStorageService(a)
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
	go utils.Schedule(context.Background(), time.Second, time.Second, func(t time.Time) {
		runtime.GC()
	})
	return app
}
