package genesis

import (
	"context"
	"fmt"
	"runtime"
	"sigma/main/core/modules"
	"sigma/main/core/utils"
	shell_websocket "sigma/main/shell/network/websocket"
	"sigma/main/shell/services"
	"time"
)

func LoadServices(a *modules.App) {
	services.CreateStorageService(a)
}

func LoadKeys() {
	modules.LoadKeys()
	if modules.FetchKeyPair("server_key") == nil {
		modules.GenerateSecureKeyPair("server_key")
	}
}

func New(appId string, databaseUri string, dbName string, redisUri string, storageRoot string, port int) *modules.App {
	fmt.Println("Creating app...")
	a := modules.App{
		AppId:       appId,
		StorageRoot: storageRoot,
	}
	modules.Keep(a)
	inst := modules.Instance()
	LoadKeys()
	inst.Database = modules.CreateDatabase(databaseUri, dbName)
	inst.Memory = modules.CreateMemory(redisUri)
	inst.Network = modules.CreateNetwork()
	LoadServices(inst)
	inst.Network.Listen(port)
	shell_websocket.LoadWebsocket(inst)
	go utils.Schedule(context.Background(), time.Second, time.Second, func(t time.Time) {
		runtime.GC()
	})
	return inst
}
