package services

import (
	"context"
	"fmt"
	dtos_rooms "sigma/main/core/dtos/rooms"
	"sigma/main/core/models"
	"sigma/main/core/runtime"
	updates_rooms "sigma/main/core/updates/rooms"
	"sigma/main/core/utils"
	"strconv"
	"strings"

	pb "sigma/main/core/models/grpc"

	"github.com/gofiber/fiber/v2"
	"google.golang.org/grpc"
)

func createRoom(app *runtime.App, input dtos_rooms.CreateDto, assistant models.Assistant) (any, error) {
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
	if err := app.Managers.DatabaseManager().Db.QueryRow(
		context.Background(), query, input.Name, input.AvatarId, assistant.TowerId, app.AppId,
	).Scan(&room.Id, &room.Name, &room.AvatarId, &room.TowerId); err != nil {
		utils.Log(5, err)
		return &pb.RoomCreateOutput{}, err
	}
	room.Origin = app.AppId
	app.Managers.MemoryManager().Put(fmt.Sprintf("city::%d", room.Id), fmt.Sprintf("%d", room.TowerId))
	go app.Managers.PushManager().PushToGroup("rooms/create", room.TowerId, updates_rooms.Create{Room: &room},
		[]models.GroupMember{
			{UserId: assistant.UserId, UserOrigin: assistant.UserOrigin},
		})
	return &pb.RoomCreateOutput{Room: &room}, nil
}

func updateRoom(app *runtime.App, input dtos_rooms.UpdateDto, assistant models.Assistant) (any, error) {
	var query = `
		update room set name = $1, avatar_id = $2 where id = $3 and tower_id = $4
		returning id, name, avatar_id, tower_id, origin;
	`
	var room pb.Room
	if err := app.Managers.DatabaseManager().Db.QueryRow(
		context.Background(), query, input.Name, input.AvatarId, input.RoomId, assistant.TowerId,
	).Scan(&room.Id, &room.Name, &room.AvatarId, &room.TowerId, &room.Origin); err != nil {
		utils.Log(5, err)
		return &pb.RoomUpdateOutput{}, err
	}
	go app.Managers.PushManager().PushToGroup("rooms/update", room.TowerId, updates_rooms.Update{Room: &room},
		[]models.GroupMember{
			{UserId: assistant.UserId, UserOrigin: assistant.UserOrigin},
		})
	return &pb.RoomUpdateOutput{Room: &room}, nil
}

func deleteRoom(app *runtime.App, input dtos_rooms.DeleteDto, assistant models.Assistant) (any, error) {
	var query = ``
	query = `
		delete from room where id = $1 and tower_id = $2
		returning id, name, avatar_id, tower_id;
	`
	var room pb.Room
	if err := app.Managers.DatabaseManager().Db.QueryRow(
		context.Background(), query, input.RoomId, assistant.TowerId,
	).Scan(&room.Id, &room.Name, &room.AvatarId, &room.TowerId); err != nil {
		utils.Log(5, err)
		return &pb.RoomDeleteOutput{}, err
	}
	app.Managers.MemoryManager().Del(fmt.Sprintf("city::%d::%d", room.TowerId, room.Id))
	go app.Managers.PushManager().PushToGroup("rooms/delete", room.TowerId, updates_rooms.Update{Room: &room},
		[]models.GroupMember{
			{UserId: assistant.UserId, UserOrigin: assistant.UserOrigin},
		})
	return &pb.RoomDeleteOutput{}, nil
}

func getRoom(app *runtime.App, input dtos_rooms.GetDto, assistant models.Assistant) (any, error) {
	var query = `
		select * from rooms_get($1, $2, $3);
	`
	var room pb.Room
	if err := app.Managers.DatabaseManager().Db.QueryRow(
		context.Background(), query, assistant.UserId, assistant.TowerId, input.RoomId,
	).Scan(&room.Id, &room.Name, &room.AvatarId, &room.Origin); err != nil {
		utils.Log(5, err)
		return &pb.RoomGetOutput{}, err
	}
	room.TowerId = assistant.TowerId
	return &pb.RoomGetOutput{Room: &room}, nil
}

var sendTemplate = "rooms/send"

func send(app *runtime.App, input dtos_rooms.SendDto, assistant models.Assistant) (any, error) {
	userOrigin := assistant.UserOrigin
	if userOrigin == "" {
		userOrigin = app.AppId
	}
	if input.Type == "broadcast" {
		var p = updates_rooms.Send{Action: "broadcast", UserId: assistant.UserId, UserType: assistant.UserType, UserOrigin: userOrigin, TowerId: assistant.TowerId, RoomId: assistant.RoomId, Data: input.Data}
		utils.Log(5, assistant.TowerId, p, assistant.UserId)
		app.Managers.PushManager().PushToGroup(sendTemplate, assistant.TowerId, p,
			[]models.GroupMember{
				{UserId: assistant.UserId, UserOrigin: userOrigin},
			})
		return &pb.RoomSendOutput{Passed: true}, nil
	} else if input.Type == "single" {
		if input.RecvType == "human" {
			memberData := app.Managers.MemoryManager().Get(fmt.Sprintf("member::%d::%d::%s", assistant.TowerId, input.RecvId, input.RecvOrigin))
			if memberData == "true" {
				var p = updates_rooms.Send{Action: "single", UserId: assistant.UserId, UserType: assistant.UserType, UserOrigin: userOrigin, TowerId: assistant.TowerId, RoomId: assistant.RoomId, Data: input.Data}
				app.Managers.PushManager().PushToUser(sendTemplate, input.RecvId, input.RecvOrigin, p, "", false)
				return &pb.RoomSendOutput{Passed: true}, nil
			}
		} else if input.RecvType == "machine" {
			workerData := app.Managers.MemoryManager().Get(fmt.Sprintf("worker::%d", input.WorkerId))
			arr := strings.Split(workerData, "/")
			if len(arr) == 3 {
				roomId, _ := strconv.ParseInt(arr[0], 10, 64)
				machineId, _ := strconv.ParseInt(arr[1], 10, 64)
				machineOrigin := arr[2]
				if roomId == assistant.RoomId {
					var p = updates_rooms.Send{Action: "broadcast", UserId: assistant.UserId, UserType: assistant.UserType, UserOrigin: userOrigin, TowerId: assistant.TowerId, RoomId: assistant.RoomId, Data: input.Data}
					app.Managers.PushManager().PushToUser(sendTemplate, machineId, machineOrigin, p, "", false)
					return &pb.RoomSendOutput{Passed: true}, nil
				}
			}
		}
	}
	return &pb.RoomSendOutput{Passed: false}, nil
}

func CreateRoomService(app *runtime.App, coreAccess bool) {

	// Tables
	app.Managers.DatabaseManager().ExecuteSqlFile("core/managers/database/tables/room.sql")

	// Functions
	app.Managers.DatabaseManager().ExecuteSqlFile("core/managers/database/functions/rooms/get.sql")

	// Methods
	app.Services.AddAction(runtime.CreateAction(
		app,
		"/rooms/create",
		runtime.CreateCk(true, true, false),
		runtime.CreateAc(coreAccess, true, false, false, fiber.MethodPost),
		true,
		createRoom,
	))
	app.Services.AddAction(runtime.CreateAction(
		app,
		"/rooms/update",
		runtime.CreateCk(true, true, false),
		runtime.CreateAc(coreAccess, true, false, false, fiber.MethodPut),
		true,
		updateRoom,
	))
	app.Services.AddAction(runtime.CreateAction(
		app,
		"/rooms/delete",
		runtime.CreateCk(true, true, false),
		runtime.CreateAc(coreAccess, true, false, false, fiber.MethodDelete),
		true,
		deleteRoom,
	))
	app.Services.AddAction(runtime.CreateAction(
		app,
		"/rooms/get",
		runtime.CreateCk(true, true, false),
		runtime.CreateAc(coreAccess, true, false, false, fiber.MethodGet),
		true,
		getRoom,
	))
	app.Services.AddAction(runtime.CreateAction(
		app,
		"/rooms/send",
		runtime.CreateCk(true, true, true),
		runtime.CreateAc(coreAccess, true, false, false, fiber.MethodPost),
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
