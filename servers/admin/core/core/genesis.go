package genesis

import (
	"context"
	"fmt"
	"runtime"
	"sigma/admin/core/models"
	"sigma/admin/core/services"
	"sigma/admin/core/types"
	"sigma/admin/core/utils"
	"time"
)

func LoadServices(a *types.App) {
	a.Services["auth"] = services.CreateAuthService(a)
}

func New(appId string, databaseUri string, redisUri string, storageRoot string, gods []models.Admin) *types.App {
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
	inst.Security = types.CreateSecurity(gods)
	go utils.Schedule(context.Background(), time.Second, time.Second, func(t time.Time) {
		runtime.GC()
	})
	return inst
}
