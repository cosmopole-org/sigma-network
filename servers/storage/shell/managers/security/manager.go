package security_manager

import (
	"context"
	"log"
	pb "sigma/storage/core/models/grpc"
	"sigma/storage/core/modules"
	"sigma/storage/shell/store/core"
)

type SecurityManager struct {
}

func (sm *SecurityManager) LoadKeys() {
	modules.LoadKeys()
	if modules.FetchKeyPair("server_key") == nil {
		modules.GenerateSecureKeyPair("server_key")
	}
}

func (sm *SecurityManager) LoadAccess() {
	var query = `
		select user_origin, origin, tower_id, human_id from member;
	`
	rows, err := core.Core().Database.Db.Query(context.Background(), query)
	if err != nil {
		log.Println(err)
	}
	for rows.Next() {
		var m pb.Member
		err := rows.Scan(&m.UserOrigin, &m.Origin, &m.TowerId, &m.HumanId)
		if err != nil {
			log.Println(err)
		}
		core.Core().Pusher.JoinGroup(m.TowerId, m.HumanId, m.UserOrigin)
	}
	if err := rows.Err(); err != nil {
		log.Println(err)
	}

	var query2 = `
		select user_origin, origin, room_id, machine_id from worker;
	`
	rows2, err2 := core.Core().Database.Db.Query(context.Background(), query2)
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
	rows3, err3 := core.Core().Database.Db.Query(context.Background(), query3, roomsArr)
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
		core.Core().Pusher.JoinGroup(roomSet[w.RoomId], w.MachineId, w.UserOrigin)
	}
}

func New() *SecurityManager {
	sm := &SecurityManager{}
	sm.LoadKeys()
	sm.LoadAccess()
	return sm
}
