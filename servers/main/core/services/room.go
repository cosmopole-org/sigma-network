package services

import (
	"context"
	"fmt"
	"log"
	dtos_rooms "sigma/main/core/dtos/rooms"
	"sigma/main/core/modules"
	updates_rooms "sigma/main/core/updates/rooms"
	"sigma/main/shell/manager"
	"strconv"
	"strings"

	pb "sigma/main/core/models/grpc"

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
		log.Println(err)
		return &pb.RoomCreateOutput{}, err
	}
	room.Origin = app.AppId
	app.Memory.Put(fmt.Sprintf("city::%d", room.Id), fmt.Sprintf("%d", room.TowerId))
	go app.Network.PusherServer.PushToGroup("rooms/create", room.TowerId, updates_rooms.Create{Room: &room},
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
		log.Println(err)
		return &pb.RoomUpdateOutput{}, err
	}
	go app.Network.PusherServer.PushToGroup("rooms/update", room.TowerId, updates_rooms.Update{Room: &room},
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
		log.Println(err)
		return &pb.RoomDeleteOutput{}, err
	}
	app.Memory.Del(fmt.Sprintf("city::%d::%d", room.TowerId, room.Id))
	go app.Network.PusherServer.PushToGroup("rooms/delete", room.TowerId, updates_rooms.Update{Room: &room},
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
		log.Println(err)
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
		log.Println(assistant.TowerId, p, assistant.UserId)
		app.Network.PusherServer.PushToGroup(sendTemplate, assistant.TowerId, p,
			[]modules.GroupMember{
				{UserId: assistant.UserId, UserOrigin: userOrigin},
			})
		return &pb.RoomSendOutput{Passed: true}, nil
	} else if input.Type == "single" {
		if input.RecvType == "human" {
			memberData := app.Memory.Get(fmt.Sprintf("member::%d::%d::%s", assistant.TowerId, input.RecvId, input.RecvOrigin))
			if memberData == "true" {
				var p = updates_rooms.Send{Action: "single", UserId: assistant.UserId, UserType: assistant.UserType, UserOrigin: userOrigin, TowerId: assistant.TowerId, RoomId: assistant.RoomId, Data: input.Data}
				app.Network.PusherServer.PushToUser(sendTemplate, input.RecvId, input.RecvOrigin, p, "", false)
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
					app.Network.PusherServer.PushToUser(sendTemplate, machineId, machineOrigin, p, "", false)
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
	manager.Instance.Endpoint(modules.CreateAction(
		"/rooms/create",
		fiber.MethodPost,
		modules.CreateCk(true, true, false),
		modules.CreateAc(coreAccess, true, false, false),
		true,
		createRoom,
	))
	manager.Instance.Endpoint(modules.CreateAction(
		"/rooms/update",
		fiber.MethodPut,
		modules.CreateCk(true, true, false),
		modules.CreateAc(coreAccess, true, false, false),
		true,
		updateRoom,
	))
	manager.Instance.Endpoint(modules.CreateAction(
		"/rooms/delete",
		fiber.MethodDelete,
		modules.CreateCk(true, true, false),
		modules.CreateAc(coreAccess, true, false, false),
		true,
		deleteRoom,
	))
	manager.Instance.Endpoint(modules.CreateAction(
		"/rooms/get",
		fiber.MethodGet,
		modules.CreateCk(true, true, false),
		modules.CreateAc(coreAccess, true, false, false),
		true,
		getRoom,
	))
	manager.Instance.Endpoint(modules.CreateAction(
		"/rooms/send",
		fiber.MethodPost,
		modules.CreateCk(true, true, true),
		modules.CreateAc(coreAccess, true, false, false),
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