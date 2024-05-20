package genesis

import (
	"context"
	"log"
	"net"
	"sigma/main/core"
	pb "sigma/main/core/models/grpc"
	"sigma/main/core/modules"
	shell_keeper "sigma/main/shell/keeper"
	"sigma/main/shell/network"
	network_manager "sigma/main/shell/network/manager"
)

type ServersOutput struct {
	Map map[string]bool `json:"map"`
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
	CoreAccess       bool
}

func New(appId string, config AppConfig) *modules.App {
	log.Println("Creating app...")
	ipToHostMap := map[string]string{}
	hostToIpMap := map[string]string{}
	for _, domain := range network_store.WellKnownServers {
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
		CoreAccess:  config.CoreAccess,
		HostToIp:    hostToIpMap,
		IpToHost:    ipToHostMap,
	}
	modules.Keep(a)
	inst := modules.Instance()
	inst.Services = modules.CreateServices()
	inst.Database = modules.CreateDatabase(config.DatabaseUri, config.DatabaseName)
	LoadKeys()
	nm := network_manager.Load(inst)
	shell_keeper.Keep(nm)
	core.LoadCoreServices(inst, config.CoreAccess)
	inst.Network = modules.CreateNetwork(func(s string, op modules.OriginPacket) {
		nm.FedNet.SendInFederation(inst, s, op)
	})
	inst.Memory = modules.CreateMemory(config.MemoryUri)
	if config.Ports["http"] > 0 {
		nm.HttpServer.Listen(config.Ports["http"])
	}
	if config.Ports["grpc"] > 0 {
		nm.GrpcServer.Listen(config.Ports["grpc"])
		core.LoadCoreGrpcServices(nm.GrpcServer.Server)
	}
	LoadAccess(inst)

	return inst
}
