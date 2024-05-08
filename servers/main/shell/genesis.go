package genesis

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"runtime"
	"sigma/main/core/modules"
	"sigma/main/core/utils"
	pb "sigma/main/shell/grpc"
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

func LoadAccess(app *modules.App) {
	var query = `
		select user_origin, origin, tower_id, human_id from member;
	`
	rows, err := app.Database.Db.Query(context.Background(), query)
	if err != nil {
		fmt.Println(err)
	}
	for rows.Next() {
		var m pb.Member
		err := rows.Scan(&m.UserOrigin, &m.Origin, &m.TowerId, &m.HumanId)
		if err != nil {
			fmt.Println(err)
		}
		app.Network.PusherServer.JoinGroup(m.TowerId, m.HumanId, m.UserOrigin)
	}
	if err := rows.Err(); err != nil {
		fmt.Println(err)
	}

	var query2 = `
		select user_origin, origin, room_id, machine_id from worker;
	`
	rows2, err2 := app.Database.Db.Query(context.Background(), query2)
	if err2 != nil {
		fmt.Println(err2)
	}
	workers := []*pb.Worker{}
	roomSet := map[int64]int64{}
	for rows2.Next() {
		var w pb.Worker
		err := rows2.Scan(&w.UserOrigin, &w.Origin, &w.RoomId, &w.MachineId)
		if err != nil {
			fmt.Println(err)
		}
		roomSet[w.RoomId] = -1
		workers = append(workers, &w)
	}
	if err2 := rows2.Err(); err2 != nil {
		fmt.Println(err2)
	}
	roomsArr := []int64{}
	for rid := range roomSet {
		roomsArr = append(roomsArr, rid)
	}

	var query3 = `
		select tower_id, id from room where id = any($1);
	`
	rows3, err3 := app.Database.Db.Query(context.Background(), query3, roomsArr)
	if err3 != nil {
		fmt.Println(err3)
	}
	for rows3.Next() {
		var roomId int64 = 0
		var towerId int64 = 0
		err := rows3.Scan(&towerId, &roomId)
		if err != nil {
			fmt.Println(err)
		}
		roomSet[roomId] = towerId
	}
	if err3 := rows3.Err(); err3 != nil {
		fmt.Println(err2)
	}

	for _, w := range workers {
		app.Network.PusherServer.JoinGroup(roomSet[w.RoomId], w.MachineId, w.UserOrigin)
	}
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
	LoadAccess(inst)
	go utils.Schedule(context.Background(), time.Second, time.Second, func(t time.Time) {
		runtime.GC()
	})
	return inst
}
