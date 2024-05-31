package services_topic

import (
	"errors"
	"fmt"
	inputs_topics "sigma/main/core/inputs/topics"
	"sigma/main/core/managers"
	"sigma/main/core/models"
	outputs_topics "sigma/main/core/outputs/topics"
	"sigma/main/core/runtime"
	updates_topics "sigma/main/core/updates/topics"
	"sigma/main/core/utils"

	"github.com/gofiber/fiber/v2"
	"google.golang.org/grpc"
)

type TopicService struct {
	managers managers.ICoreManagers
}

func (s *TopicService) create(control *runtime.Control, input inputs_topics.CreateInput, info models.Info) (any, error) {
	space := models.Space{Id: info.Member.SpaceId}
	control.Trx.First(&space)
	topic := models.Topic{Id: utils.SecureUniqueId(control.AppId), Title: input.Title, Avatar: input.Avatar, SpaceId: space.Id}
	control.Trx.Create(&topic)
	s.managers.MemoryManager().Put(fmt.Sprintf("city::%s", topic.Id), topic.SpaceId)
	go s.managers.PushManager().PushToGroup("topics/create", topic.SpaceId, updates_topics.Create{Topic: topic},
		[]models.Client{
			{UserId: info.User.Id},
		})
	return outputs_topics.CreateOutput{Topic: topic}, nil
}

func (s *TopicService) update(control *runtime.Control, input inputs_topics.UpdateInput, info models.Info) (any, error) {
	space := models.Space{Id: info.Member.SpaceId}
	control.Trx.First(&space)
	topic := models.Topic{Id: input.TopicId}
	control.Trx.First(&topic)
	topic.Title = input.Title
	topic.Avatar = input.Avatar
	control.Trx.Save(&topic)
	go s.managers.PushManager().PushToGroup("topics/update", topic.SpaceId, updates_topics.Update{Topic: topic},
		[]models.Client{
			{UserId: info.User.Id},
		})
	return outputs_topics.UpdateOutput{Topic: topic}, nil
}

func (s *TopicService) delete(control *runtime.Control, input inputs_topics.DeleteInput, info models.Info) (any, error) {
	space := models.Space{Id: info.Member.SpaceId}
	control.Trx.First(&space)
	topic := models.Topic{Id: input.TopicId}
	err := control.Trx.First(&topic).Error()
	if err != nil {
		return nil, err
	}
	control.Trx.Delete(&topic)
	s.managers.MemoryManager().Del(fmt.Sprintf("city::%s", topic.Id))
	go s.managers.PushManager().PushToGroup("topics/delete", topic.SpaceId, updates_topics.Update{Topic: topic},
		[]models.Client{
			{UserId: info.User.Id},
		})
	return outputs_topics.DeleteOutput{Topic: topic}, nil
}

func (s *TopicService) get(control *runtime.Control, input inputs_topics.GetInput, info models.Info) (any, error) {
	space := models.Space{Id: info.Member.SpaceId}
	control.Trx.First(&space)
	topic := models.Topic{Id: input.TopicId}
	control.Trx.First(&topic)
	if space.IsPublic {
		return outputs_topics.GetOutput{Topic: topic}, nil
	}
	member := models.Member{}
	err := control.Trx.Where("space_id = ?", space.Id).Where("user_id = ?", info.User.Id).First(&member).Error()
	if err != nil {
		return nil, errors.New("access to space denied")
	}
	return outputs_topics.GetOutput{Topic: topic}, nil
}

var sendTemplate = "topics/send"

func (s *TopicService) send(control *runtime.Control, input inputs_topics.SendInput, info models.Info) (any, error) {
	if input.Type == "broadcast" {
		var p = updates_topics.Send{Action: "broadcast", User: info.User, Topic: models.Topic{SpaceId: info.Member.SpaceId, Id: input.TopicId}, Data: input.Data}
		s.managers.PushManager().PushToGroup(sendTemplate, info.Member.SpaceId, p,
			[]models.Client{
				{UserId: info.User.Id},
			})
		return outputs_topics.SendOutput{Passed: true}, nil
	} else if input.Type == "single" {
		memberData := s.managers.MemoryManager().Get(fmt.Sprintf("member::%s::%s", info.Member.SpaceId, input.RecvId))
		if memberData == "true" {
			var p = updates_topics.Send{Action: "single", User: info.User, Topic: models.Topic{SpaceId: info.Member.SpaceId, Id: input.TopicId}, Data: input.Data}
			s.managers.PushManager().PushToUser(sendTemplate, input.RecvId, p, "", false)
			return outputs_topics.SendOutput{Passed: true}, nil
		}
	}
	return outputs_topics.SendOutput{Passed: false}, nil
}

func CreateTopicService(app *runtime.App) {

	service := &TopicService{managers: app.Managers}

	app.Managers.StorageManager().AutoMigrate(&models.Topic{})

	app.Services.AddAction(runtime.CreateAction(
		app,
		"/topics/create",
		runtime.CreateCk(true, true, false),
		runtime.CreateAc(app.CoreAccess, true, false, false, fiber.MethodPost),
		true,
		service.create,
	))
	app.Services.AddAction(runtime.CreateAction(
		app,
		"/topics/update",
		runtime.CreateCk(true, true, false),
		runtime.CreateAc(app.CoreAccess, true, false, false, fiber.MethodPut),
		true,
		service.update,
	))
	app.Services.AddAction(runtime.CreateAction(
		app,
		"/topics/delete",
		runtime.CreateCk(true, true, false),
		runtime.CreateAc(app.CoreAccess, true, false, false, fiber.MethodDelete),
		true,
		service.delete,
	))
	app.Services.AddAction(runtime.CreateAction(
		app,
		"/topics/get",
		runtime.CreateCk(true, true, false),
		runtime.CreateAc(app.CoreAccess, true, false, false, fiber.MethodGet),
		true,
		service.get,
	))
	app.Services.AddAction(runtime.CreateAction(
		app,
		"/topics/send",
		runtime.CreateCk(true, true, true),
		runtime.CreateAc(app.CoreAccess, true, false, false, fiber.MethodPost),
		true,
		service.send,
	))
}

func LoadTopicGrpcService(grpcServer *grpc.Server) {
	// type server struct {
	// 	pb.UnimplementedTopicServiceServer
	// }
	// pb.RegisterTopicServiceServer(grpcServer, &server{})
}
