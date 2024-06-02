package services_topic

import (
	"errors"
	"fmt"
	inputs_topics "sigma/storage/core/inputs/topics"
	"sigma/storage/core/models"
	outputs_topics "sigma/storage/core/outputs/topics"
	"sigma/storage/core/runtime"
	updates_topics "sigma/storage/core/updates/topics"
	"sigma/storage/core/utils"

	"github.com/gofiber/fiber/v2"
	"google.golang.org/grpc"
)

type TopicService struct {
	App *runtime.App
}

// Create /topics/create check [ true true false ] access [ true false false false POST ]
func (s *TopicService) Create(control *runtime.Control, input inputs_topics.CreateInput, info models.Info) (any, error) {
	space := models.Space{Id: info.Member.SpaceId}
	control.Trx.First(&space)
	topic := models.Topic{Id: utils.SecureUniqueId(control.AppId), Title: input.Title, Avatar: input.Avatar, SpaceId: space.Id}
	control.Trx.Create(&topic)
	s.App.Adapters().Cache().Put(fmt.Sprintf("city::%s", topic.Id), topic.SpaceId)
	go s.App.Signaler().SignalGroup("topics/create", topic.SpaceId, updates_topics.Create{Topic: topic}, true, []string{info.User.Id})
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
	go s.App.Signaler().SignalGroup("topics/update", topic.SpaceId, updates_topics.Update{Topic: topic}, true, []string{info.User.Id})
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
	s.App.Adapters().Cache().Del(fmt.Sprintf("city::%s", topic.Id))
	go s.App.Signaler().SignalGroup("topics/delete", topic.SpaceId, updates_topics.Delete{Topic: topic}, true, []string{info.User.Id})
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
		s.App.Signaler().SignalGroup(sendTemplate, info.Member.SpaceId, p, true, []string{info.User.Id})
		return outputs_topics.SendOutput{Passed: true}, nil
	} else if input.Type == "single" {
		memberData := s.App.Adapters().Cache().Get(fmt.Sprintf("member::%s::%s", info.Member.SpaceId, input.RecvId))
		if memberData == "true" {
			var p = updates_topics.Send{Action: "single", User: info.User, Topic: models.Topic{SpaceId: info.Member.SpaceId, Id: input.TopicId}, Data: input.Data}
			s.App.Signaler().SignalUser(sendTemplate, "", input.RecvId, p, true)
			return outputs_topics.SendOutput{Passed: true}, nil
		}
	}
	return outputs_topics.SendOutput{Passed: false}, nil
}

func CreateTopicService(App *runtime.App) {

	service := &TopicService{App: App}

	App.Adapters().Storage().AutoMigrate(&models.Topic{})

	App.Services().AddAction(runtime.CreateAction(
		App,
		"/topics/update",
		runtime.CreateCk(true, true, false),
		runtime.CreateAc(App.OpenToNet, true, false, false, fiber.MethodPut),
		true,
		service.update,
	))
	App.Services().AddAction(runtime.CreateAction(
		App,
		"/topics/delete",
		runtime.CreateCk(true, true, false),
		runtime.CreateAc(App.OpenToNet, true, false, false, fiber.MethodDelete),
		true,
		service.delete,
	))
	App.Services().AddAction(runtime.CreateAction(
		App,
		"/topics/get",
		runtime.CreateCk(true, true, false),
		runtime.CreateAc(App.OpenToNet, true, false, false, fiber.MethodGet),
		true,
		service.get,
	))
	App.Services().AddAction(runtime.CreateAction(
		App,
		"/topics/send",
		runtime.CreateCk(true, true, true),
		runtime.CreateAc(App.OpenToNet, true, false, false, fiber.MethodPost),
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
