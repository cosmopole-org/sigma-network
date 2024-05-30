package services_topic

import (
	"errors"
	"fmt"
	inputs_topics "sigma/admin/core/inputs/topics"
	"sigma/admin/core/models"
	outputs_topics "sigma/admin/core/outputs/topics"
	"sigma/admin/core/runtime"
	updates_topics "sigma/admin/core/updates/topics"
	"sigma/admin/core/utils"

	"github.com/gofiber/fiber/v2"
	"google.golang.org/grpc"
	"gorm.io/gorm"
)

func create(app *runtime.App, tx *gorm.DB, input inputs_topics.CreateInput, info models.Info) (any, error) {
	space := models.Space{Id: info.Member.SpaceId}
	tx.First(&space)
	topic := models.Topic{Id: utils.SecureUniqueId(app.AppId), Title: input.Title, Avatar: input.Avatar, SpaceId: space.Id}
	tx.Create(&topic)
	app.Managers.MemoryManager().Put(fmt.Sprintf("city::%s", topic.Id), topic.SpaceId)
	go app.Managers.PushManager().PushToGroup("topics/create", topic.SpaceId, updates_topics.Create{Topic: topic},
		[]models.Client{
			{UserId: info.User.Id},
		})
	return outputs_topics.CreateOutput{Topic: topic}, nil
}

func update(app *runtime.App, tx *gorm.DB, input inputs_topics.UpdateInput, info models.Info) (any, error) {
	space := models.Space{Id: info.Member.SpaceId}
	tx.First(&space)
	topic := models.Topic{Id: input.TopicId, Title: input.Title, Avatar: input.Avatar}
	tx.Save(&topic)
	go app.Managers.PushManager().PushToGroup("topics/update", topic.SpaceId, updates_topics.Update{Topic: topic},
		[]models.Client{
			{UserId: info.User.Id},
		})
	return outputs_topics.UpdateOutput{Topic: topic}, nil
}

func delete(app *runtime.App, tx *gorm.DB, input inputs_topics.DeleteInput, info models.Info) (any, error) {
	space := models.Space{Id: info.Member.SpaceId}
	tx.First(&space)
	topic := models.Topic{Id: input.TopicId}
	tx.First(&topic)
	tx.Delete(&topic)
	app.Managers.MemoryManager().Del(fmt.Sprintf("city::%s", topic.Id))
	go app.Managers.PushManager().PushToGroup("topics/delete", topic.SpaceId, updates_topics.Update{Topic: topic},
		[]models.Client{
			{UserId: info.User.Id},
		})
	return outputs_topics.DeleteOutput{Topic: topic}, nil
}

func get(app *runtime.App, tx *gorm.DB, input inputs_topics.GetInput, info models.Info) (any, error) {
	space := models.Space{Id: info.Member.SpaceId}
	tx.First(&space)
	topic := models.Topic{Id: input.TopicId}
	tx.First(&topic)
	if space.IsPublic {
		return outputs_topics.GetOutput{Topic: topic}, nil
	}
	member := models.Member{}
	err := tx.Where("space_id = ?", space.Id).Where("user_id = ?", info.User.Id).First(&member).Error
	if err != nil {
		return nil, errors.New("access to space denied")
	}
	return outputs_topics.GetOutput{Topic: topic}, nil
}

var sendTemplate = "topics/send"

func send(app *runtime.App, tx *gorm.DB, input inputs_topics.SendInput, info models.Info) (any, error) {
	if input.Type == "broadcast" {
		var p = updates_topics.Send{Action: "broadcast", User: info.User, Topic: models.Topic{SpaceId: info.Member.SpaceId, Id: input.TopicId}, Data: input.Data}
		app.Managers.PushManager().PushToGroup(sendTemplate, info.Member.SpaceId, p,
			[]models.Client{
				{UserId: info.User.Id},
			})
		return outputs_topics.SendOutput{Passed: true}, nil
	} else if input.Type == "single" {
		memberData := app.Managers.MemoryManager().Get(fmt.Sprintf("member::%s::%s", info.Member.SpaceId, input.RecvId))
		if memberData == "true" {
			var p = updates_topics.Send{Action: "single", User: info.User, Topic: models.Topic{SpaceId: info.Member.SpaceId, Id: input.TopicId}, Data: input.Data}
			app.Managers.PushManager().PushToUser(sendTemplate, input.RecvId, p, "", false)
			return outputs_topics.SendOutput{Passed: true}, nil
		}
	}
	return outputs_topics.SendOutput{Passed: false}, nil
}

func CreateTopicService(app *runtime.App, openToNet bool) {

	app.Managers.DatabaseManager().Db.AutoMigrate(&models.Topic{})

	app.Services.AddAction(runtime.CreateAction(
		app,
		"/topics/create",
		runtime.CreateCk(true, true, false),
		runtime.CreateAc(openToNet, true, false, false, fiber.MethodPost),
		true,
		create,
	))
	app.Services.AddAction(runtime.CreateAction(
		app,
		"/topics/update",
		runtime.CreateCk(true, true, false),
		runtime.CreateAc(openToNet, true, false, false, fiber.MethodPut),
		true,
		update,
	))
	app.Services.AddAction(runtime.CreateAction(
		app,
		"/topics/delete",
		runtime.CreateCk(true, true, false),
		runtime.CreateAc(openToNet, true, false, false, fiber.MethodDelete),
		true,
		delete,
	))
	app.Services.AddAction(runtime.CreateAction(
		app,
		"/topics/get",
		runtime.CreateCk(true, true, false),
		runtime.CreateAc(openToNet, true, false, false, fiber.MethodGet),
		true,
		get,
	))
	app.Services.AddAction(runtime.CreateAction(
		app,
		"/topics/send",
		runtime.CreateCk(true, true, true),
		runtime.CreateAc(openToNet, true, false, false, fiber.MethodPost),
		true,
		send,
	))
}

func LoadTopicGrpcService(grpcServer *grpc.Server) {
	// type server struct {
	// 	pb.UnimplementedTopicServiceServer
	// }
	// pb.RegisterTopicServiceServer(grpcServer, &server{})
}
