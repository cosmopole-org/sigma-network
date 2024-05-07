package genesis

import (
	"context"
	"fmt"
	"runtime"
	"sigma/admin/core/modules"
	"sigma/admin/core/utils"
	pb "sigma/admin/shell/grpc"
	"sigma/admin/shell/models"
	shell_websocket "sigma/admin/shell/network/websocket"
	"sigma/admin/shell/services"
	"time"

	"google.golang.org/grpc"
)

type ServersOutput struct {
	Map map[string]pb.Server `json:"map"`
}

func LoadServices(a *modules.App) {
	services.CreateAuthService(a)
}

func LoadGrpcServices(gs *grpc.Server) {
	services.LoadAuthGrpcService(gs)
}

func LoadKeys() {
	modules.LoadKeys()
	if modules.FetchKeyPair("server_key") == nil {
		modules.GenerateSecureKeyPair("server_key")
	}
}

func New(appId string, databaseUri string, dbName string, redisUri string, storageRoot string, port int, gods []models.Admin) *modules.App {
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
	inst.Security = modules.CreateSecurity(gods)
	go utils.Schedule(context.Background(), time.Second, time.Second, func(t time.Time) {
		runtime.GC()
	})
	return inst
}
