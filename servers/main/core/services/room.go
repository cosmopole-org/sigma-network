package services

import (
	"context"
	"fmt"
	"sigma/main/core/models"
	"sigma/main/core/modules"
	updates_rooms "sigma/main/core/updates/rooms"
	"strconv"

	pb "sigma/main/core/grpc"
)

func createRoom(app *modules.App, dto interface{}, assistant modules.Assistant) (any, error) {
	var input = (dto).(*pb.RoomCreateDto)
	var query = `
		insert into room
		(
			name,
			avatar_id,
			tower_id,
			origin
		) values ($1, $2, $3, $4)
		returning id, name, avatar_id, tower_id;
	`
	var room pb.Room
	if err := app.Database.Db.QueryRow(
		context.Background(), query, input.Name, input.AvatarId, assistant.TowerId, app.AppId,
	).Scan(&room.Id, &room.Name, &room.AvatarId, &room.TowerId); err != nil {
		fmt.Println(err)
		return &pb.RoomCreateOutput{}, err
	}
	room.Origin = app.AppId
	app.Memory.Put(fmt.Sprintf("city::%d", room.Id), fmt.Sprintf("%d", room.TowerId))
	go app.Network.PusherServer.PushToGroup(room.TowerId, updates_rooms.Create{Room: &room}, []int64{})
	return &pb.RoomCreateOutput{Room: &room}, nil
}

func updateRoom(app *modules.App, dto interface{}, assistant modules.Assistant) (any, error) {
	var input = (dto).(*pb.RoomUpdateDto)
	var query = `
		update room set name = $1, avatar_id = $2 where id = $3 and tower_id = $4
		returning id, name, avatar_id, tower_id, origin;
	`
	var room pb.Room
	if err := app.Database.Db.QueryRow(
		context.Background(), query, input.Name, input.AvatarId, input.RoomId, assistant.TowerId,
	).Scan(&room.Id, &room.Name, &room.AvatarId, &room.TowerId, &room.Origin); err != nil {
		fmt.Println(err)
		return &pb.RoomUpdateOutput{}, err
	}
	go app.Network.PusherServer.PushToGroup(room.TowerId, updates_rooms.Update{Room: &room}, []int64{})
	return &pb.RoomUpdateOutput{Room: &room}, nil
}

func deleteRoom(app *modules.App, dto interface{}, assistant modules.Assistant) (any, error) {
	var input = (dto).(*pb.RoomDeleteDto)
	var query = ``
	query = `
		delete from room where id = $1 and tower_id = $2
		returning id, name, avatar_id, tower_id;
	`
	var room models.Room
	if err := app.Database.Db.QueryRow(
		context.Background(), query, input.RoomId, assistant.TowerId,
	).Scan(&room.Id, &room.Name, &room.AvatarId, &room.TowerId); err != nil {
		fmt.Println(err)
		return &pb.RoomDeleteOutput{}, err
	}
	app.Memory.Del(fmt.Sprintf("city::%d::%d", room.TowerId, room.Id))
	go app.Network.PusherServer.PushToGroup(room.TowerId, updates_rooms.Update{Room: room}, []int64{})
	return &pb.RoomDeleteOutput{}, nil
}

func getRoom(app *modules.App, dto interface{}, assistant modules.Assistant) (any, error) {
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
	if err := app.Database.Db.QueryRow(
		context.Background(), query, assistant.UserId, assistant.TowerId, roomId,
	).Scan(&room.Id, &room.Name, &room.AvatarId, &room.Origin); err != nil {
		fmt.Println(err)
		return &pb.RoomGetOutput{}, err
	}
	room.TowerId = assistant.TowerId
	return &pb.RoomGetOutput{Room: &room}, nil
}

func CreateRoomService(app *modules.App) *modules.Service {

	// Tables
	app.Database.ExecuteSqlFile("core/database/tables/room.sql")

	// Functions
	app.Database.ExecuteSqlFile("core/database/functions/rooms/get.sql")

	var s = modules.CreateService(app, "sigma.RoomService")
	s.AddGrpcLoader(func() {
		type server struct {
			pb.UnimplementedRoomServiceServer
		}
		pb.RegisterRoomServiceServer(app.Network.GrpcServer, &server{})
	})
	// s.AddMethod(modules.CreateMethod("create", createRoom, modules.CreateCheck(true, true, false), pb.RoomCreateDto{}, modules.CreateMethodOptions(true, true, false)))
	// s.AddMethod(modules.CreateMethod("update", updateRoom, modules.CreateCheck(true, true, false), pb.RoomUpdateDto{}, modules.CreateMethodOptions(true, true, false)))
	// s.AddMethod(modules.CreateMethod("delete", deleteRoom, modules.CreateCheck(true, true, false), pb.RoomDeleteDto{}, modules.CreateMethodOptions(true, true, false)))
	// s.AddMethod(modules.CreateMethod("get", getRoom, modules.CreateCheck(true, true, false), pb.RoomGetDto{}, modules.CreateMethodOptions(true, true, false)))
	return s
}
