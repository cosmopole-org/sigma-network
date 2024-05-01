package genesis

import (
	"context"
	"fmt"
	"runtime"
	"sigma/map/core/modules"
	"sigma/map/core/services"
	"sigma/map/core/utils"
	"time"
)

func LoadServices(a *modules.App) {
	a.Services["map"] = services.CreateMapService(a)
}

func New(appId string, databaseUri string, redisUri string, storageRoot string) *modules.App {
	fmt.Println("Creating app...")
	a := modules.App{
		AppId:       appId,
		StorageRoot: storageRoot,
		Services:    map[string]*modules.Service{},
	}
	modules.Keep(a)
	inst := modules.Instance()
	inst.Database = modules.CreateDatabase(databaseUri)
	inst.Memory = modules.CreateMemory(redisUri)
	inst.Network = modules.CreateNetwork()
	LoadServices(inst)
	go utils.Schedule(context.Background(), time.Second, time.Second, func(t time.Time) {
		runtime.GC()
	})
	return inst
}
