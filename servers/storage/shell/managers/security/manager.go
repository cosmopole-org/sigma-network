package security_manager

import (
	"context"
	pb "sigma/storage/core/models/grpc"
	"sigma/storage/core/runtime"
	"sigma/storage/core/utils"
	base_manager "sigma/storage/shell/managers/base"
)

type SecurityManager struct {
	base_manager.BaseManager
}

func (sm *SecurityManager) LoadKeys() {
	if sm.App.Managers.CryptoManager().FetchKeyPair("server_key") == nil {
		sm.App.Managers.CryptoManager().GenerateSecureKeyPair("server_key")
	}
}

func (sm *SecurityManager) LoadAccess() {
	var query = `
		select user_origin, origin, tower_id, human_id from member;
	`
	rows, err := sm.App.Managers.DatabaseManager().Db.Query(context.Background(), query)
	if err != nil {
		utils.Log(5, err)
	}
	for rows.Next() {
		var m pb.Member
		err := rows.Scan(&m.UserOrigin, &m.Origin, &m.TowerId, &m.HumanId)
		if err != nil {
			utils.Log(5, err)
		}
		sm.App.Managers.PushManager().JoinGroup(m.TowerId, m.HumanId, m.UserOrigin)
	}
	if err := rows.Err(); err != nil {
		utils.Log(5, err)
	}

	var query2 = `
		select user_origin, origin, room_id, machine_id from worker;
	`
	rows2, err2 := sm.App.Managers.DatabaseManager().Db.Query(context.Background(), query2)
	if err2 != nil {
		utils.Log(5, err2)
	}
	workers := []*pb.Worker{}
	roomSet := map[int64]int64{}
	for rows2.Next() {
		var w pb.Worker
		err := rows2.Scan(&w.UserOrigin, &w.Origin, &w.RoomId, &w.MachineId)
		if err != nil {
			utils.Log(5, err)
		}
		roomSet[w.RoomId] = -1
		workers = append(workers, &w)
	}
	if err2 := rows2.Err(); err2 != nil {
		utils.Log(5, err2)
	}
	roomsArr := []int64{}
	for rid := range roomSet {
		roomsArr = append(roomsArr, rid)
	}

	var query3 = `
		select tower_id, id from room where id = any($1);
	`
	rows3, err3 := sm.App.Managers.DatabaseManager().Db.Query(context.Background(), query3, roomsArr)
	if err3 != nil {
		utils.Log(5, err3)
	}
	for rows3.Next() {
		var roomId int64 = 0
		var towerId int64 = 0
		err := rows3.Scan(&towerId, &roomId)
		if err != nil {
			utils.Log(5, err)
		}
		roomSet[roomId] = towerId
	}
	if err3 := rows3.Err(); err3 != nil {
		utils.Log(5, err2)
	}

	for _, w := range workers {
		sm.App.Managers.PushManager().JoinGroup(roomSet[w.RoomId], w.MachineId, w.UserOrigin)
	}
}

func New(sc *runtime.App) *SecurityManager {
	sm := &SecurityManager{}
	sm.App = sc
	sm.LoadKeys()
	sm.LoadAccess()
	return sm
}
