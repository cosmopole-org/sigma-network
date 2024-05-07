package services

import (
	"context"
	"fmt"
	"sigma/main/core/modules"
	dtos_rooms "sigma/main/shell/dtos/rooms"
	updates_rooms "sigma/main/shell/updates/rooms"

	pb "sigma/main/shell/grpc"

	"github.com/gofiber/fiber/v2"
	"google.golang.org/grpc"
)

func createRoom(app *modules.App, input dtos_rooms.CreateDto, assistant modules.Assistant) (any, error) {
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
	go app.Network.PusherServer.PushToGroup("rooms/create", room.TowerId, updates_rooms.Create{Room: &room}, []int64{assistant.UserId})
	return &pb.RoomCreateOutput{Room: &room}, nil
}

func updateRoom(app *modules.App, input dtos_rooms.UpdateDto, assistant modules.Assistant) (any, error) {
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
	go app.Network.PusherServer.PushToGroup("rooms/update", room.TowerId, updates_rooms.Update{Room: &room}, []int64{})
	return &pb.RoomUpdateOutput{Room: &room}, nil
}

func deleteRoom(app *modules.App, input dtos_rooms.DeleteDto, assistant modules.Assistant) (any, error) {
	var query = ``
	query = `
		delete from room where id = $1 and tower_id = $2
		returning id, name, avatar_id, tower_id;
	`
	var room pb.Room
	if err := app.Database.Db.QueryRow(
		context.Background(), query, input.RoomId, assistant.TowerId,
	).Scan(&room.Id, &room.Name, &room.AvatarId, &room.TowerId); err != nil {
		fmt.Println(err)
		return &pb.RoomDeleteOutput{}, err
	}
	app.Memory.Del(fmt.Sprintf("city::%d::%d", room.TowerId, room.Id))
	go app.Network.PusherServer.PushToGroup("rooms/delete", room.TowerId, updates_rooms.Update{Room: &room}, []int64{})
	return &pb.RoomDeleteOutput{}, nil
}

func getRoom(app *modules.App, input dtos_rooms.GetDto, assistant modules.Assistant) (any, error) {
	var query = `
		select * from rooms_get($1, $2, $3);
	`
	var room pb.Room
	if err := app.Database.Db.QueryRow(
		context.Background(), query, assistant.UserId, assistant.TowerId, input.RoomId,
	).Scan(&room.Id, &room.Name, &room.AvatarId, &room.Origin); err != nil {
		fmt.Println(err)
		return &pb.RoomGetOutput{}, err
	}
	room.TowerId = assistant.TowerId
	return &pb.RoomGetOutput{Room: &room}, nil
}

func CreateRoomService(app *modules.App) {

	// Tables
	app.Database.ExecuteSqlFile("shell/database/tables/room.sql")

	// Functions
	app.Database.ExecuteSqlFile("shell/database/functions/rooms/get.sql")

	// Methods
	modules.AddMethod(
		app,
		modules.CreateMethod[dtos_rooms.CreateDto, dtos_rooms.CreateDto](
			"/rooms/create",
			createRoom,
			dtos_rooms.CreateDto{},
			modules.CreateCheck(true, true, false),
			modules.CreateMethodOptions(true, fiber.MethodPost, true, true),
			modules.CreateInterFedOptions(true, true),
		),
	)
	modules.AddMethod(
		app,
		modules.CreateMethod[dtos_rooms.UpdateDto, dtos_rooms.UpdateDto](
			"/rooms/update",
			updateRoom,
			dtos_rooms.UpdateDto{},
			modules.CreateCheck(true, true, false),
			modules.CreateMethodOptions(true, fiber.MethodPut, true, false),
			modules.CreateInterFedOptions(true, true),
		),
	)
	modules.AddMethod(
		app,
		modules.CreateMethod[dtos_rooms.DeleteDto, dtos_rooms.DeleteDto](
			"/rooms/delete",
			deleteRoom,
			dtos_rooms.DeleteDto{},
			modules.CreateCheck(true, true, false),
			modules.CreateMethodOptions(true, fiber.MethodDelete, true, false),
			modules.CreateInterFedOptions(true, true),
		),
	)
	modules.AddMethod(
		app,
		modules.CreateMethod[dtos_rooms.GetDto, dtos_rooms.GetDto](
			"/rooms/get",
			getRoom,
			dtos_rooms.GetDto{},
			modules.CreateCheck(true, true, false),
			modules.CreateMethodOptions(true, fiber.MethodGet, true, false),
			modules.CreateInterFedOptions(false, false),
		),
	)
}

func LoadRoomGrpcService(grpcServer *grpc.Server) {
	type server struct {
		pb.UnimplementedRoomServiceServer
	}
	pb.RegisterRoomServiceServer(grpcServer, &server{})
}
