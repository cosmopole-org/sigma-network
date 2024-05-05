package genesis

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"runtime"
	pb "sigma/main/shell/grpc"
	"sigma/main/core/modules"
	"sigma/main/core/utils"
	shell_grpc "sigma/main/shell/network/grpc"
	shell_websocket "sigma/main/shell/network/websocket"
	"sigma/main/shell/services"
	"time"

	"google.golang.org/grpc"
)

type ServersOutput struct {
	Map map[string]pb.Server `json:"map"`
}

func LoadServices(a *modules.App) {
	services.CreateDummyService(a)
	services.CreateAuthService(a)
	services.CreateHumanService(a)
	services.CreateInviteService(a)
	services.CreateTowerService(a)
	services.CreateRoomService(a)
	services.CreateMachineService(a)
	services.CreateWorkerService(a)
	services.CreateStorageService(a)
}

func LoadGrpcServices(gs *grpc.Server) {
	services.LoadAuthGrpcService(gs)
	services.LoadHumanGrpcService(gs)
	services.LoadInviteGrpcService(gs)
	services.LoadTowerGrpcService(gs)
	services.LoadRoomGrpcService(gs)
	services.LoadMachineGrpcService(gs)
	services.LoadWorkerGrpcService(gs)
}

func LoadKeys() {
	modules.LoadKeys()
	if modules.FetchKeyPair("server_key") == nil {
		modules.GenerateSecureKeyPair("server_key")
	}
}

func New(appId string, databaseUri string, dbName string, redisUri string, storageRoot string, ports map[string]int, mapServerAddr string) *modules.App {
	fmt.Println("Creating app...")
	serversMap := map[string]pb.Server{}
	serversMapRes, err := http.Get(mapServerAddr + "/map/get")
	if err == nil {
		if serversMapRes.StatusCode != http.StatusOK {
			fmt.Println("fetching servers map failed")
		} else {
			serversMapStr, err2 := io.ReadAll(serversMapRes.Body)
			if err2 != nil {
				fmt.Println(err)
			}
			fmt.Println("Federation: ", string(serversMapStr))
			var res ServersOutput
			err3 := json.Unmarshal(serversMapStr, &res)
			if err3 != nil {
				fmt.Println(err3)
			} else {
				serversMap = res.Map
			}
		}
		serversMapRes.Body.Close()
	}
	a := modules.App{
		AppId:       appId,
		StorageRoot: storageRoot,
		Federation:  serversMap,
	}
	modules.Keep(a)
	inst := modules.Instance()
	LoadKeys()
	inst.Database = modules.CreateDatabase(databaseUri, dbName)
	inst.Memory = modules.CreateMemory(redisUri)
	inst.Network = modules.CreateNetwork()
	LoadServices(inst)
	if ports["http"] > 0 {
		inst.Network.Listen(ports["http"])
		shell_websocket.LoadWebsocket(inst)
	}
	if ports["grpc"] > 0 {
		gs := shell_grpc.LoadGrpcServer()
		LoadGrpcServices(gs.Server)
		gs.ListenForGrpc(ports["grpc"])
	}
	go utils.Schedule(context.Background(), time.Second, time.Second, func(t time.Time) {
		runtime.GC()
	})
	return inst
}
