package services

import (
	"context"
	"fmt"
	dtos_rooms "sigma/core/src/dtos/rooms"
	"sigma/core/src/interfaces"
	"sigma/core/src/models"
	outputs_rooms "sigma/core/src/outputs/rooms"
	"sigma/core/src/types"
	updates_rooms "sigma/core/src/updates/rooms"
	"sigma/core/src/utils"
	"strconv"
)

func createRoom(app interfaces.IApp, dto interface{}, assistant interfaces.IAssistant) (any, error) {
	var input = (dto).(*dtos_rooms.CreateDto)
	var query = `
		insert into room
		(
			name,
			avatar_id,
			tower_id
		) values ($1, $2, $3)
		returning id, name, avatar_id, tower_id;
	`
	var room models.Room
	if err := app.GetDatabase().GetDb().QueryRow(
		context.Background(), query, input.Name, input.AvatarId, assistant.GetTowerId(),
	).Scan(&room.Id, &room.Name, &room.AvatarId, &room.TowerId); err != nil {
		fmt.Println(err)
		return outputs_rooms.CreateOutput{}, err
	}
	app.GetMemory().Put(fmt.Sprintf("city::%d", room.Id), fmt.Sprintf("%d", room.TowerId))
	go app.GetNetwork().GetPusherServer().PushToGroup(room.TowerId, updates_rooms.Create{Room: room}, []int64{})
	return outputs_rooms.CreateOutput{Room: room}, nil
}

func updateRoom(app interfaces.IApp, dto interface{}, assistant interfaces.IAssistant) (any, error) {
	var input = (dto).(*dtos_rooms.UpdateDto)
	var query = `
		update room set name = $1, avatar_id = $2 where id = $3 and tower_id = $4
		returning id, name, avatar_id, tower_id;
	`
	var room models.Room
	if err := app.GetDatabase().GetDb().QueryRow(
		context.Background(), query, input.Name, input.AvatarId, input.RoomId, assistant.GetTowerId(),
	).Scan(&room.Id, &room.Name, &room.AvatarId, &room.TowerId); err != nil {
		fmt.Println(err)
		return outputs_rooms.UpdateOutput{}, err
	}
	go app.GetNetwork().GetPusherServer().PushToGroup(room.TowerId, updates_rooms.Update{Room: room}, []int64{})
	return outputs_rooms.UpdateOutput{Room: room}, nil
}

func deleteRoom(app interfaces.IApp, dto interface{}, assistant interfaces.IAssistant) (any, error) {
	var input = (dto).(*dtos_rooms.DeleteDto)
	var query = ``
	query = `
		delete from room where id = $1 and tower_id = $2
		returning id, name, avatar_id, tower_id;
	`
	var room models.Room
	if err := app.GetDatabase().GetDb().QueryRow(
		context.Background(), query, query, input.RoomId, assistant.GetTowerId(),
	).Scan(&room.Id, &room.Name, &room.AvatarId, &room.TowerId); err != nil {
		fmt.Println(err)
		return outputs_rooms.DeleteOutput{}, err
	}
	app.GetMemory().Del(fmt.Sprintf("city::%d::%d", room.TowerId, room.Id))
	go app.GetNetwork().GetPusherServer().PushToGroup(room.TowerId, updates_rooms.Update{Room: room}, []int64{})
	return outputs_rooms.DeleteOutput{}, nil
}

func getRoom(app interfaces.IApp, dto interface{}, assistant interfaces.IAssistant) (any, error) {
	var input = (dto).(*dtos_rooms.GetDto)
	var query = `
		select * from rooms_get($1, $2, $3);
	`
	var room models.Room
	roomId, err := strconv.ParseInt(input.RoomId, 10, 64)
	if err != nil {
		fmt.Println(err)
		return outputs_rooms.GetOutput{}, err
	}
	if err := app.GetDatabase().GetDb().QueryRow(
		context.Background(), query, assistant.GetUserId(), assistant.GetTowerId(), roomId,
	).Scan(&room.Id, &room.Name, &room.AvatarId); err != nil {
		fmt.Println(err)
		return outputs_rooms.GetOutput{}, err
	}
	room.TowerId = assistant.GetTowerId()
	return outputs_rooms.GetOutput{Room: room}, nil
}

func CreateRoomService(app interfaces.IApp) interfaces.IService {

	// Tables
	utils.ExecuteSqlFile("src/database/tables/room.sql")

	// Functions
	utils.ExecuteSqlFile("src/database/functions/rooms/get.sql")

	var s = types.CreateService(app, "rooms")
	s.AddMethod(types.CreateMethod("create", createRoom, types.CreateCheck(true, true, false), dtos_rooms.CreateDto{}, types.CreateMethodOptions(true, false)))
	s.AddMethod(types.CreateMethod("update", updateRoom, types.CreateCheck(true, true, false), dtos_rooms.UpdateDto{}, types.CreateMethodOptions(true, false)))
	s.AddMethod(types.CreateMethod("delete", deleteRoom, types.CreateCheck(true, true, false), dtos_rooms.DeleteDto{}, types.CreateMethodOptions(true, false)))
	s.AddMethod(types.CreateMethod("get", getRoom, types.CreateCheck(true, true, false), dtos_rooms.GetDto{}, types.CreateMethodOptions(true, false)))
	return s
}
