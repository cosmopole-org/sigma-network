package genesis

import (
	"context"
	"fmt"
	"runtime"
	"sigma/map/core/services"
	"sigma/map/core/types"
	"sigma/map/core/utils"
	"time"
)

func LoadServices(a *types.App) {
	a.Services["map"] = services.CreateMapService(a)
}

func New(appId string, databaseUri string, redisUri string, storageRoot string) *types.App {
	fmt.Println("Creating app...")
	a := types.App{
		AppId:       appId,
		StorageRoot: storageRoot,
		Services:    map[string]*types.Service{},
	}
	types.Keep(a)
	inst := types.Instance()
	inst.Database = types.CreateDatabase(databaseUri)
	inst.Memory = types.CreateMemory(redisUri)
	inst.Network = types.CreateNetwork()
	LoadServices(inst)
	go utils.Schedule(context.Background(), time.Second, time.Second, func(t time.Time) {
		runtime.GC()
	})
	return inst
}
