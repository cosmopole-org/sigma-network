package actions_topic

import (
	"errors"
	"fmt"
	"sigma/main/core/models"
	outputs_topics "sigma/main/core/outputs/topics"
	"sigma/main/core/runtime"
	updates_topics "sigma/main/core/updates/topics"
	"sigma/main/core/utils"
)

var sendTemplate = "topics/send"

type TopicActions struct {
	App *runtime.App
}

// Create /topics/create check [ true true false ] access [ true false false false POST ]
func (a *TopicActions) Create(s abstract.IState, input inputs_*.*) (any, error) {
	space := models.Space{Id: info.Member.SpaceId}
	context.Trx.First(&space)
	topic := models.Topic{Id: utils.SecureUniqueId(context.AppId), Title: input.Title, Avatar: input.Avatar, SpaceId: space.Id}
	context.Trx.Create(&topic)
	context.Adapters().Cache().Put(fmt.Sprintf("city::%s", topic.Id), topic.SpaceId)
	go context.Signaler().SignalGroup("topics/create", topic.SpaceId, updates_topics.Create{Topic: topic}, true, []string{info.User.Id})
	return outputs_topics.CreateOutput{Topic: topic}, nil
}

// Update /topics/update check [ true true false ] access [ true false false false PUT ]
func (a *TopicActions) Update(s abstract.IState, input inputs_*.*) (any, error) {
	space := models.Space{Id: info.Member.SpaceId}
	context.Trx.First(&space)
	topic := models.Topic{Id: input.TopicId}
	context.Trx.First(&topic)
	topic.Title = input.Title
	topic.Avatar = input.Avatar
	context.Trx.Save(&topic)
	go context.Signaler().SignalGroup("topics/update", topic.SpaceId, updates_topics.Update{Topic: topic}, true, []string{info.User.Id})
	return outputs_topics.UpdateOutput{Topic: topic}, nil
}

// Delete /topics/delete check [ true true false ] access [ true false false false DELETE ]
func (a *TopicActions) Delete(s abstract.IState, input inputs_*.*) (any, error) {
	space := models.Space{Id: info.Member.SpaceId}
	context.Trx.First(&space)
	topic := models.Topic{Id: input.TopicId}
	err := context.Trx.First(&topic).Error()
	if err != nil {
		return nil, err
	}
	context.Trx.Delete(&topic)
	context.Adapters().Cache().Del(fmt.Sprintf("city::%s", topic.Id))
	go context.Signaler().SignalGroup("topics/delete", topic.SpaceId, updates_topics.Delete{Topic: topic}, true, []string{info.User.Id})
	return outputs_topics.DeleteOutput{Topic: topic}, nil
}

// Get /topics/get check [ true true false ] access [ true false false false GET ]
func (a *TopicActions) Get(s abstract.IState, input inputs_*.*) (any, error) {
	space := models.Space{Id: info.Member.SpaceId}
	context.Trx.First(&space)
	topic := models.Topic{Id: input.TopicId}
	context.Trx.First(&topic)
	if space.IsPublic {
		return outputs_topics.GetOutput{Topic: topic}, nil
	}
	member := models.Member{}
	err := context.Trx.Where("space_id = ?", space.Id).Where("user_id = ?", info.User.Id).First(&member).Error()
	if err != nil {
		return nil, errors.New("access to space denied")
	}
	return outputs_topics.GetOutput{Topic: topic}, nil
}

// Send /topics/send check [ true true true ] access [ true false false false POST ]
func (a *TopicActions) Send(s abstract.IState, input inputs_*.*) (any, error) {
	if input.Type == "broadcast" {
		var p = updates_topics.Send{Action: "broadcast", User: info.User, Topic: models.Topic{SpaceId: info.Member.SpaceId, Id: input.TopicId}, Data: input.Data}
		context.Signaler().SignalGroup(sendTemplate, info.Member.SpaceId, p, true, []string{info.User.Id})
		return outputs_topics.SendOutput{Passed: true}, nil
	} else if input.Type == "single" {
		memberData := context.Adapters().Cache().Get(fmt.Sprintf("member::%s::%s", info.Member.SpaceId, input.RecvId))
		if memberData == "true" {
			var p = updates_topics.Send{Action: "single", User: info.User, Topic: models.Topic{SpaceId: info.Member.SpaceId, Id: input.TopicId}, Data: input.Data}
			context.Signaler().SignalUser(sendTemplate, "", input.RecvId, p, true)
			return outputs_topics.SendOutput{Passed: true}, nil
		}
	}
	return outputs_topics.SendOutput{Passed: false}, nil
}
