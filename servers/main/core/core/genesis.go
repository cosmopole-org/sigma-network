package genesis

import (
	"context"
	"fmt"
	"runtime"
	"sigma/main/core/services"
	"sigma/main/core/types"
	"sigma/main/core/utils"
	"time"
)

func LoadServices(a *types.App) {
	a.Services["sigma.HumanService"] = services.CreateHumanService(a)
	a.Services["humans"] = a.Services["sigma.HumanService"]
	a.Services["sigma.TowerService"] = services.CreateTowerService(a)
	a.Services["towers"] = a.Services["sigma.TowerService"]
	a.Services["sigma.RoomService"] = services.CreateRoomService(a)
	a.Services["rooms"] = a.Services["sigma.RoomService"]
	a.Services["sigma.InviteService"] = services.CreateInviteService(a)
	a.Services["invites"] = a.Services["sigma.InviteService"]
	a.Services["sigma.MachineService"] = services.CreateMachineService(a)
	a.Services["machines"] = a.Services["sigma.MachineService"]
	a.Services["sigma.WorkerService"] = services.CreateWorkerService(a)
	a.Services["workers"] = a.Services["sigma.WorkerService"]
	a.Services["storage"] = services.CreateStorageService(a)
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
