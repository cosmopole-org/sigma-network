package genesis

import (
	"context"
	"fmt"
	"runtime"
	"sigma/admin/core/models"
	"sigma/admin/core/modules"
	"sigma/admin/core/services"
	"sigma/admin/core/utils"
	"time"
)

func LoadServices(a *modules.App) {
	a.Services["auth"] = services.CreateAuthService(a)
}

func New(appId string, databaseUri string, redisUri string, storageRoot string, gods []models.Admin) *modules.App {
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
	inst.Security = modules.CreateSecurity(gods)
	go utils.Schedule(context.Background(), time.Second, time.Second, func(t time.Time) {
		runtime.GC()
	})
	return inst
}
