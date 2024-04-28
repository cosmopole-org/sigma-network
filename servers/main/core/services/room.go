package services

import (
	"context"
	"fmt"
	"sigma/main/core/interfaces"
	"sigma/main/core/models"
	"sigma/main/core/types"
	updates_rooms "sigma/main/core/updates/rooms"
	"sigma/main/core/utils"
	"strconv"

	pb "sigma/main/core/grpc"
)

func createRoom(app interfaces.IApp, dto interface{}, assistant interfaces.IAssistant) (any, error) {
	var input = (dto).(*pb.RoomCreateDto)
	var query = `
		insert into room
		(
			name,
			avatar_id,
			tower_id
		) values ($1, $2, $3)
		returning id, name, avatar_id, tower_id;
	`
	var room pb.Room
	if err := app.GetDatabase().GetDb().QueryRow(
		context.Background(), query, input.Name, input.AvatarId, assistant.GetTowerId(),
	).Scan(&room.Id, &room.Name, &room.AvatarId, &room.TowerId); err != nil {
		fmt.Println(err)
		return &pb.RoomCreateOutput{}, err
	}
	app.GetMemory().Put(fmt.Sprintf("city::%d", room.Id), fmt.Sprintf("%d", room.TowerId))
	go app.GetNetwork().GetPusherServer().PushToGroup(room.TowerId, updates_rooms.Create{Room: &room}, []int64{})
	return &pb.RoomCreateOutput{Room: &room}, nil
}

func updateRoom(app interfaces.IApp, dto interface{}, assistant interfaces.IAssistant) (any, error) {
	var input = (dto).(*pb.RoomUpdateDto)
	var query = `
		update room set name = $1, avatar_id = $2 where id = $3 and tower_id = $4
		returning id, name, avatar_id, tower_id;
	`
	var room pb.Room
	if err := app.GetDatabase().GetDb().QueryRow(
		context.Background(), query, input.Name, input.AvatarId, input.RoomId, assistant.GetTowerId(),
	).Scan(&room.Id, &room.Name, &room.AvatarId, &room.TowerId); err != nil {
		fmt.Println(err)
		return &pb.RoomUpdateOutput{}, err
	}
	go app.GetNetwork().GetPusherServer().PushToGroup(room.TowerId, updates_rooms.Update{Room: &room}, []int64{})
	return &pb.RoomUpdateOutput{Room: &room}, nil
}

func deleteRoom(app interfaces.IApp, dto interface{}, assistant interfaces.IAssistant) (any, error) {
	var input = (dto).(*pb.RoomDeleteDto)
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
		return &pb.RoomDeleteOutput{}, err
	}
	app.GetMemory().Del(fmt.Sprintf("city::%d::%d", room.TowerId, room.Id))
	go app.GetNetwork().GetPusherServer().PushToGroup(room.TowerId, updates_rooms.Update{Room: room}, []int64{})
	return &pb.RoomDeleteOutput{}, nil
}

func getRoom(app interfaces.IApp, dto interface{}, assistant interfaces.IAssistant) (any, error) {
	var input = (dto).(*pb.RoomGetDto)
	var query = `
		select * from rooms_get($1, $2, $3);
	`
	var room pb.Room
	roomId, err := strconv.ParseInt(input.RoomId, 10, 64)
	if err != nil {
		fmt.Println(err)
		return &pb.RoomGetOutput{}, err
	}
	if err := app.GetDatabase().GetDb().QueryRow(
		context.Background(), query, assistant.GetUserId(), assistant.GetTowerId(), roomId,
	).Scan(&room.Id, &room.Name, &room.AvatarId); err != nil {
		fmt.Println(err)
		return &pb.RoomGetOutput{}, err
	}
	room.TowerId = assistant.GetTowerId()
	return &pb.RoomGetOutput{Room: &room}, nil
}

func CreateRoomService(app interfaces.IApp) interfaces.IService {

	// Tables
	utils.ExecuteSqlFile("core/database/tables/room.sql")

	// Functions
	utils.ExecuteSqlFile("core/database/functions/rooms/get.sql")

	var s = types.CreateService(app, "sigma.RoomService")
	s.AddGrpcLoader(func() {
		type server struct {
			pb.UnimplementedRoomServiceServer
		}
		pb.RegisterRoomServiceServer(app.GetNetwork().GetGrpcServer(), &server{})
	})
	s.AddMethod(types.CreateMethod("create", createRoom, types.CreateCheck(true, true, false), pb.RoomCreateDto{}, types.CreateMethodOptions(true, false)))
	s.AddMethod(types.CreateMethod("update", updateRoom, types.CreateCheck(true, true, false), pb.RoomUpdateDto{}, types.CreateMethodOptions(true, false)))
	s.AddMethod(types.CreateMethod("delete", deleteRoom, types.CreateCheck(true, true, false), pb.RoomDeleteDto{}, types.CreateMethodOptions(true, false)))
	s.AddMethod(types.CreateMethod("get", getRoom, types.CreateCheck(true, true, false), pb.RoomGetDto{}, types.CreateMethodOptions(true, false)))
	return s
}
