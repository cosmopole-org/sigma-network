package actions_topic

import (
	"errors"
	"fmt"
	inputs_topics "sigma/storage/core/inputs/topics"
	"sigma/storage/core/models"
	outputs_topics "sigma/storage/core/outputs/topics"
	"sigma/storage/core/runtime"
	updates_topics "sigma/storage/core/updates/topics"
	"sigma/storage/core/utils"
)

var sendTemplate = "topics/send"

type TopicActions struct {
	App *runtime.App
}

// Create /topics/create check [ true true false ] access [ true false false false POST ]
func (a *TopicActions) Create(control *runtime.Control, input inputs_topics.CreateInput, info models.Info) (any, error) {
	space := models.Space{Id: info.Member.SpaceId}
	control.Trx.First(&space)
	topic := models.Topic{Id: utils.SecureUniqueId(control.AppId), Title: input.Title, Avatar: input.Avatar, SpaceId: space.Id}
	control.Trx.Create(&topic)
	control.Adapters().Cache().Put(fmt.Sprintf("city::%s", topic.Id), topic.SpaceId)
	go control.Signaler().SignalGroup("topics/create", topic.SpaceId, updates_topics.Create{Topic: topic}, true, []string{info.User.Id})
	return outputs_topics.CreateOutput{Topic: topic}, nil
}

// Update /topics/update check [ true true false ] access [ true false false false PUT ]
func (a *TopicActions) Update(control *runtime.Control, input inputs_topics.UpdateInput, info models.Info) (any, error) {
	space := models.Space{Id: info.Member.SpaceId}
	control.Trx.First(&space)
	topic := models.Topic{Id: input.TopicId}
	control.Trx.First(&topic)
	topic.Title = input.Title
	topic.Avatar = input.Avatar
	control.Trx.Save(&topic)
	go control.Signaler().SignalGroup("topics/update", topic.SpaceId, updates_topics.Update{Topic: topic}, true, []string{info.User.Id})
	return outputs_topics.UpdateOutput{Topic: topic}, nil
}

// Delete /topics/delete check [ true true false ] access [ true false false false DELETE ]
func (a *TopicActions) Delete(control *runtime.Control, input inputs_topics.DeleteInput, info models.Info) (any, error) {
	space := models.Space{Id: info.Member.SpaceId}
	control.Trx.First(&space)
	topic := models.Topic{Id: input.TopicId}
	err := control.Trx.First(&topic).Error()
	if err != nil {
		return nil, err
	}
	control.Trx.Delete(&topic)
	control.Adapters().Cache().Del(fmt.Sprintf("city::%s", topic.Id))
	go control.Signaler().SignalGroup("topics/delete", topic.SpaceId, updates_topics.Delete{Topic: topic}, true, []string{info.User.Id})
	return outputs_topics.DeleteOutput{Topic: topic}, nil
}

// Get /topics/get check [ true true false ] access [ true false false false GET ]
func (a *TopicActions) Get(control *runtime.Control, input inputs_topics.GetInput, info models.Info) (any, error) {
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

// Send /topics/send check [ true true true ] access [ true false false false POST ]
func (a *TopicActions) Send(control *runtime.Control, input inputs_topics.SendInput, info models.Info) (any, error) {
	if input.Type == "broadcast" {
		var p = updates_topics.Send{Action: "broadcast", User: info.User, Topic: models.Topic{SpaceId: info.Member.SpaceId, Id: input.TopicId}, Data: input.Data}
		control.Signaler().SignalGroup(sendTemplate, info.Member.SpaceId, p, true, []string{info.User.Id})
		return outputs_topics.SendOutput{Passed: true}, nil
	} else if input.Type == "single" {
		memberData := control.Adapters().Cache().Get(fmt.Sprintf("member::%s::%s", info.Member.SpaceId, input.RecvId))
		if memberData == "true" {
			var p = updates_topics.Send{Action: "single", User: info.User, Topic: models.Topic{SpaceId: info.Member.SpaceId, Id: input.TopicId}, Data: input.Data}
			control.Signaler().SignalUser(sendTemplate, "", input.RecvId, p, true)
			return outputs_topics.SendOutput{Passed: true}, nil
		}
	}
	return outputs_topics.SendOutput{Passed: false}, nil
}
