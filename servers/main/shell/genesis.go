package genesis

import (
	"context"
	"log"
	"net"
	"sigma/main/core/modules"
	pb "sigma/main/shell/grpc"
	shell_grpc "sigma/main/shell/network/grpc"
	shell_websocket "sigma/main/shell/network/websocket"
	"sigma/main/shell/services"

	"google.golang.org/grpc"
)

var wellKnownServers = []string{
	"cosmopole.liara.run",
	"monopole.liara.run",
}

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
	services.CreateExternalService(a)
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
		log.Println(err)
	}
	for rows.Next() {
		var m pb.Member
		err := rows.Scan(&m.UserOrigin, &m.Origin, &m.TowerId, &m.HumanId)
		if err != nil {
			log.Println(err)
		}
		app.Network.PusherServer.JoinGroup(m.TowerId, m.HumanId, m.UserOrigin)
	}
	if err := rows.Err(); err != nil {
		log.Println(err)
	}

	var query2 = `
		select user_origin, origin, room_id, machine_id from worker;
	`
	rows2, err2 := app.Database.Db.Query(context.Background(), query2)
	if err2 != nil {
		log.Println(err2)
	}
	workers := []*pb.Worker{}
	roomSet := map[int64]int64{}
	for rows2.Next() {
		var w pb.Worker
		err := rows2.Scan(&w.UserOrigin, &w.Origin, &w.RoomId, &w.MachineId)
		if err != nil {
			log.Println(err)
		}
		roomSet[w.RoomId] = -1
		workers = append(workers, &w)
	}
	if err2 := rows2.Err(); err2 != nil {
		log.Println(err2)
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
		log.Println(err3)
	}
	for rows3.Next() {
		var roomId int64 = 0
		var towerId int64 = 0
		err := rows3.Scan(&towerId, &roomId)
		if err != nil {
			log.Println(err)
		}
		roomSet[roomId] = towerId
	}
	if err3 := rows3.Err(); err3 != nil {
		log.Println(err2)
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
	DatabaseUri      string
	DatabaseName     string
	MemoryUri        string
	StorageRoot      string
	Ports            map[string]int
	EnableFederation bool
}

func New(appId string, config AppConfig) *modules.App {
	log.Println("Creating app...")
	ipToHostMap := map[string]string{}
	hostToIpMap := map[string]string{}
	for _, domain := range wellKnownServers {
		ipAddr := ""
		ips, _ := net.LookupIP(domain)
		for _, ip := range ips {
			if ipv4 := ip.To4(); ipv4 != nil {
				ipAddr = ipv4.String()
				break
			}
		}
		ipToHostMap[ipAddr] = domain
		hostToIpMap[domain] = ipAddr
	}
	log.Println()
	log.Println(hostToIpMap)
	log.Println()
	a := modules.App{
		AppId:       appId,
		StorageRoot: config.StorageRoot,
		Federative:  config.EnableFederation,
		HostToIp:    hostToIpMap,
		IpToHost:    ipToHostMap,
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

	return inst
}
