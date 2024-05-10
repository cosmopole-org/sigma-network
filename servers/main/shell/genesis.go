package genesis

import (
	"context"
	"fmt"
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
	Map map[string]bool `json:"map"`
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

type AppConfig struct {
	DatabaseUri string
	DatabaseName string
	MemoryUri string
	StorageRoot string
	Ports map[string]int
	MapServerAddress string
	EnableFederation bool
}

func New(appId string, config AppConfig) *modules.App {
	fmt.Println("Creating app...")
	a := modules.App{
		AppId:       appId,
		StorageRoot: config.StorageRoot,
		Federative: config.EnableFederation,
	}
	modules.Keep(a)
	inst := modules.Instance()
	LoadKeys()
	inst.Database = modules.CreateDatabase(config.DatabaseUri, config.DatabaseName)
	inst.Network = modules.CreateNetwork()
	inst.Memory = modules.CreateMemory(config.MemoryUri)
	LoadServices(inst)
	if config.Ports["http"] > 0 {
		inst.Network.Listen(config.Ports["http"])
		shell_websocket.LoadWebsocket(inst)
	}
	if config.Ports["grpc"] > 0 {
		gs := shell_grpc.LoadGrpcServer()
		LoadGrpcServices(gs.Server)
		gs.ListenForGrpc(config.Ports["grpc"])
	}
	LoadAccess(inst)
	go utils.Schedule(context.Background(), time.Second, time.Second, func(t time.Time) {
		runtime.GC()
	})

	return inst
}
