package services

import (
	"context"
	"fmt"
	dtos_rooms "sigma/admin/core/dtos/rooms"
	"sigma/admin/core/modules"
	updates_rooms "sigma/admin/core/updates/rooms"
	"sigma/admin/core/utils"
	"strconv"
	"strings"

	pb "sigma/admin/core/models/grpc"

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
		utils.Log(5, err)
		return &pb.RoomCreateOutput{}, err
	}
	room.Origin = app.AppId
	app.Memory.Put(fmt.Sprintf("city::%d", room.Id), fmt.Sprintf("%d", room.TowerId))
	go app.Pusher.PushToGroup("rooms/create", room.TowerId, updates_rooms.Create{Room: &room},
		[]modules.GroupMember{
			{UserId: assistant.UserId, UserOrigin: assistant.UserOrigin},
		})
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
		utils.Log(5, err)
		return &pb.RoomUpdateOutput{}, err
	}
	go app.Pusher.PushToGroup("rooms/update", room.TowerId, updates_rooms.Update{Room: &room},
		[]modules.GroupMember{
			{UserId: assistant.UserId, UserOrigin: assistant.UserOrigin},
		})
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
		utils.Log(5, err)
		return &pb.RoomDeleteOutput{}, err
	}
	app.Memory.Del(fmt.Sprintf("city::%d::%d", room.TowerId, room.Id))
	go app.Pusher.PushToGroup("rooms/delete", room.TowerId, updates_rooms.Update{Room: &room},
		[]modules.GroupMember{
			{UserId: assistant.UserId, UserOrigin: assistant.UserOrigin},
		})
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
		utils.Log(5, err)
		return &pb.RoomGetOutput{}, err
	}
	room.TowerId = assistant.TowerId
	return &pb.RoomGetOutput{Room: &room}, nil
}

var sendTemplate = "rooms/send"

func send(app *modules.App, input dtos_rooms.SendDto, assistant modules.Assistant) (any, error) {
	userOrigin := assistant.UserOrigin
	if userOrigin == "" {
		userOrigin = app.AppId
	}
	if input.Type == "broadcast" {
		var p = updates_rooms.Send{Action: "broadcast", UserId: assistant.UserId, UserType: assistant.UserType, UserOrigin: userOrigin, TowerId: assistant.TowerId, RoomId: assistant.RoomId, Data: input.Data}
		utils.Log(5, assistant.TowerId, p, assistant.UserId)
		app.Pusher.PushToGroup(sendTemplate, assistant.TowerId, p,
			[]modules.GroupMember{
				{UserId: assistant.UserId, UserOrigin: userOrigin},
			})
		return &pb.RoomSendOutput{Passed: true}, nil
	} else if input.Type == "single" {
		if input.RecvType == "human" {
			memberData := app.Memory.Get(fmt.Sprintf("member::%d::%d::%s", assistant.TowerId, input.RecvId, input.RecvOrigin))
			if memberData == "true" {
				var p = updates_rooms.Send{Action: "single", UserId: assistant.UserId, UserType: assistant.UserType, UserOrigin: userOrigin, TowerId: assistant.TowerId, RoomId: assistant.RoomId, Data: input.Data}
				app.Pusher.PushToUser(sendTemplate, input.RecvId, input.RecvOrigin, p, "", false)
				return &pb.RoomSendOutput{Passed: true}, nil
			}
		} else if input.RecvType == "machine" {
			workerData := app.Memory.Get(fmt.Sprintf("worker::%d", input.WorkerId))
			arr := strings.Split(workerData, "/")
			if len(arr) == 3 {
				roomId, _ := strconv.ParseInt(arr[0], 10, 64)
				machineId, _ := strconv.ParseInt(arr[1], 10, 64)
				machineOrigin := arr[2]
				if roomId == assistant.RoomId {
					var p = updates_rooms.Send{Action: "broadcast", UserId: assistant.UserId, UserType: assistant.UserType, UserOrigin: userOrigin, TowerId: assistant.TowerId, RoomId: assistant.RoomId, Data: input.Data}
					app.Pusher.PushToUser(sendTemplate, machineId, machineOrigin, p, "", false)
					return &pb.RoomSendOutput{Passed: true}, nil
				}
			}
		}
	}
	return &pb.RoomSendOutput{Passed: false}, nil
}

func CreateRoomService(app *modules.App, coreAccess bool) {

	// Tables
	app.Database.ExecuteSqlFile("core/database/tables/room.sql")

	// Functions
	app.Database.ExecuteSqlFile("core/database/functions/rooms/get.sql")

	// Methods
	app.Services.AddAction(modules.CreateAction(
		app,
		"/rooms/create",
		modules.CreateCk(true, true, false),
		modules.CreateAc(coreAccess, true, false, false, fiber.MethodPost),
		true,
		createRoom,
	))
	app.Services.AddAction(modules.CreateAction(
		app,
		"/rooms/update",
		modules.CreateCk(true, true, false),
		modules.CreateAc(coreAccess, true, false, false, fiber.MethodPut),
		true,
		updateRoom,
	))
	app.Services.AddAction(modules.CreateAction(
		app,
		"/rooms/delete",
		modules.CreateCk(true, true, false),
		modules.CreateAc(coreAccess, true, false, false, fiber.MethodDelete),
		true,
		deleteRoom,
	))
	app.Services.AddAction(modules.CreateAction(
		app,
		"/rooms/get",
		modules.CreateCk(true, true, false),
		modules.CreateAc(coreAccess, true, false, false, fiber.MethodGet),
		true,
		getRoom,
	))
	app.Services.AddAction(modules.CreateAction(
		app,
		"/rooms/send",
		modules.CreateCk(true, true, true),
		modules.CreateAc(coreAccess, true, false, false, fiber.MethodPost),
		true,
		send,
	))
}

func LoadRoomGrpcService(grpcServer *grpc.Server) {
	type server struct {
		pb.UnimplementedRoomServiceServer
	}
	pb.RegisterRoomServiceServer(grpcServer, &server{})
}
