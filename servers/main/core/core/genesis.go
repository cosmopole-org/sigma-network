package genesis

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"runtime"
	pb "sigma/main/core/grpc"
	"sigma/main/core/services"
	"sigma/main/core/types"
	"sigma/main/core/utils"
	"time"
)

type ServersOutput struct {
	Map map[string]pb.Server `json:"map"`
}

func LoadServices(a *types.App) {
	a.Services["sigma.AuthService"] = services.CreateAuthService(a)
	a.Services["auth"] = a.Services["sigma.AuthService"]
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

func LoadKeys() {
	types.LoadKeys()
	if types.FetchKeyPair("server_public_key") == nil {
		types.GenerateSecureKeyPair("server_public_key")
	}
}

func New(appId string, databaseUri string, redisUri string, storageRoot string, mapServerAddr string) *types.App {
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
	a := types.App{
		AppId:       appId,
		StorageRoot: storageRoot,
		Services:    map[string]*types.Service{},
		Federation:  serversMap,
	}
	types.Keep(a)
	inst := types.Instance()
	LoadKeys()
	inst.Database = types.CreateDatabase(databaseUri)
	inst.Memory = types.CreateMemory(redisUri)
	inst.Network = types.CreateNetwork()
	LoadServices(inst)
	go utils.Schedule(context.Background(), time.Second, time.Second, func(t time.Time) {
		runtime.GC()
	})
	return inst
}
