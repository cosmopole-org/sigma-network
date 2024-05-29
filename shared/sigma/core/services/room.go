package services

import (
	"context"
	"fmt"
	inputs_topics "sigma/main/core/inputs/topics"
	"sigma/main/core/models"
	"sigma/main/core/runtime"
	updates_topics "sigma/main/core/updates/topics"
	"sigma/main/core/utils"
	"strconv"
	"strings"

	pb "sigma/main/core/models/grpc"

	"github.com/gofiber/fiber/v2"
	"google.golang.org/grpc"
)

func createTopic(app *runtime.App, input inputs_topics.CreateInput, info models.Info) (any, error) {
	var query = `
		insert into topic
		(
			name,
			avatar_id,
			space_id,
			origin
		) values ($1, $2, $3, $4)
		returning id, name, avatar_id, space_id;
	`
	var topic pb.Topic
	if err := app.Managers.DatabaseManager().Db.QueryRow(
		context.Background(), query, input.Name, input.AvatarId, info.SpaceId, app.AppId,
	).Scan(&topic.Id, &topic.Name, &topic.AvatarId, &topic.SpaceId); err != nil {
		utils.Log(5, err)
		return &pb.TopicCreateOutput{}, err
	}
	topic.Origin = app.AppId
	app.Managers.MemoryManager().Put(fmt.Sprintf("city::%d", topic.Id), fmt.Sprintf("%d", topic.SpaceId))
	go app.Managers.PushManager().PushToGroup("topics/create", topic.SpaceId, updates_topics.Create{Topic: &topic},
		[]models.GroupMember{
			{UserId: info.UserId, UserOrigin: info.UserOrigin},
		})
	return &pb.TopicCreateOutput{Topic: &topic}, nil
}

func updateTopic(app *runtime.App, input inputs_topics.UpdateInput, info models.Info) (any, error) {
	var query = `
		update topic set name = $1, avatar_id = $2 where id = $3 and space_id = $4
		returning id, name, avatar_id, space_id, origin;
	`
	var topic pb.Topic
	if err := app.Managers.DatabaseManager().Db.QueryRow(
		context.Background(), query, input.Name, input.AvatarId, input.TopicId, info.SpaceId,
	).Scan(&topic.Id, &topic.Name, &topic.AvatarId, &topic.SpaceId, &topic.Origin); err != nil {
		utils.Log(5, err)
		return &pb.TopicUpdateOutput{}, err
	}
	go app.Managers.PushManager().PushToGroup("topics/update", topic.SpaceId, updates_topics.Update{Topic: &topic},
		[]models.GroupMember{
			{UserId: info.UserId, UserOrigin: info.UserOrigin},
		})
	return &pb.TopicUpdateOutput{Topic: &topic}, nil
}

func deleteTopic(app *runtime.App, input inputs_topics.DeleteInput, info models.Info) (any, error) {
	var query = ``
	query = `
		delete from topic where id = $1 and space_id = $2
		returning id, name, avatar_id, space_id;
	`
	var topic pb.Topic
	if err := app.Managers.DatabaseManager().Db.QueryRow(
		context.Background(), query, input.TopicId, info.SpaceId,
	).Scan(&topic.Id, &topic.Name, &topic.AvatarId, &topic.SpaceId); err != nil {
		utils.Log(5, err)
		return &pb.TopicDeleteOutput{}, err
	}
	app.Managers.MemoryManager().Del(fmt.Sprintf("city::%d::%d", topic.SpaceId, topic.Id))
	go app.Managers.PushManager().PushToGroup("topics/delete", topic.SpaceId, updates_topics.Update{Topic: &topic},
		[]models.GroupMember{
			{UserId: info.UserId, UserOrigin: info.UserOrigin},
		})
	return &pb.TopicDeleteOutput{}, nil
}

func getTopic(app *runtime.App, input inputs_topics.GetInput, info models.Info) (any, error) {
	var query = `
		select * from topics_get($1, $2, $3);
	`
	var topic pb.Topic
	if err := app.Managers.DatabaseManager().Db.QueryRow(
		context.Background(), query, info.UserId, info.SpaceId, input.TopicId,
	).Scan(&topic.Id, &topic.Name, &topic.AvatarId, &topic.Origin); err != nil {
		utils.Log(5, err)
		return &pb.TopicGetOutput{}, err
	}
	topic.SpaceId = info.SpaceId
	return &pb.TopicGetOutput{Topic: &topic}, nil
}

var sendTemplate = "topics/send"

func send(app *runtime.App, input inputs_topics.SendInput, info models.Info) (any, error) {
	userOrigin := info.UserOrigin
	if userOrigin == "" {
		userOrigin = app.AppId
	}
	if input.Type == "broadcast" {
		var p = updates_topics.Send{Action: "broadcast", UserId: info.UserId, UserType: info.UserType, UserOrigin: userOrigin, SpaceId: info.SpaceId, TopicId: info.TopicId, Data: input.Data}
		utils.Log(5, info.SpaceId, p, info.UserId)
		app.Managers.PushManager().PushToGroup(sendTemplate, info.SpaceId, p,
			[]models.GroupMember{
				{UserId: info.UserId, UserOrigin: userOrigin},
			})
		return &pb.TopicSendOutput{Passed: true}, nil
	} else if input.Type == "single" {
		if input.RecvType == "human" {
			memberData := app.Managers.MemoryManager().Get(fmt.Sprintf("member::%d::%d::%s", info.SpaceId, input.RecvId, input.RecvOrigin))
			if memberData == "true" {
				var p = updates_topics.Send{Action: "single", UserId: info.UserId, UserType: info.UserType, UserOrigin: userOrigin, SpaceId: info.SpaceId, TopicId: info.TopicId, Data: input.Data}
				app.Managers.PushManager().PushToUser(sendTemplate, input.RecvId, input.RecvOrigin, p, "", false)
				return &pb.TopicSendOutput{Passed: true}, nil
			}
		} else if input.RecvType == "machine" {
			workerData := app.Managers.MemoryManager().Get(fmt.Sprintf("worker::%d", input.WorkerId))
			arr := strings.Split(workerData, "/")
			if len(arr) == 3 {
				topicId, _ := strconv.ParseInt(arr[0], 10, 64)
				machineId, _ := strconv.ParseInt(arr[1], 10, 64)
				machineOrigin := arr[2]
				if topicId == info.TopicId {
					var p = updates_topics.Send{Action: "broadcast", UserId: info.UserId, UserType: info.UserType, UserOrigin: userOrigin, SpaceId: info.SpaceId, TopicId: info.TopicId, Data: input.Data}
					app.Managers.PushManager().PushToUser(sendTemplate, machineId, machineOrigin, p, "", false)
					return &pb.TopicSendOutput{Passed: true}, nil
				}
			}
		}
	}
	return &pb.TopicSendOutput{Passed: false}, nil
}

func CreateTopicService(app *runtime.App, coreAccess bool) {

	// Tables
	app.Managers.DatabaseManager().ExecuteSqlFile("core/managers/database/tables/topic.sql")

	// Functions
	app.Managers.DatabaseManager().ExecuteSqlFile("core/managers/database/functions/topics/get.sql")

	// Methods
	app.Services.AddAction(runtime.CreateAction(
		app,
		"/topics/create",
		runtime.CreateCk(true, true, false),
		runtime.CreateAc(coreAccess, true, false, false, fiber.MethodPost),
		true,
		createTopic,
	))
	app.Services.AddAction(runtime.CreateAction(
		app,
		"/topics/update",
		runtime.CreateCk(true, true, false),
		runtime.CreateAc(coreAccess, true, false, false, fiber.MethodPut),
		true,
		updateTopic,
	))
	app.Services.AddAction(runtime.CreateAction(
		app,
		"/topics/delete",
		runtime.CreateCk(true, true, false),
		runtime.CreateAc(coreAccess, true, false, false, fiber.MethodDelete),
		true,
		deleteTopic,
	))
	app.Services.AddAction(runtime.CreateAction(
		app,
		"/topics/get",
		runtime.CreateCk(true, true, false),
		runtime.CreateAc(coreAccess, true, false, false, fiber.MethodGet),
		true,
		getTopic,
	))
	app.Services.AddAction(runtime.CreateAction(
		app,
		"/topics/send",
		runtime.CreateCk(true, true, true),
		runtime.CreateAc(coreAccess, true, false, false, fiber.MethodPost),
		true,
		send,
	))
}

func LoadTopicGrpcService(grpcServer *grpc.Server) {
	type server struct {
		pb.UnimplementedTopicServiceServer
	}
	pb.RegisterTopicServiceServer(grpcServer, &server{})
}
