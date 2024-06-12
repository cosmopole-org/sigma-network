package actions_topic

import (
	"errors"
	"fmt"
	"sigma/sigma/abstract"
	modulestate "sigma/sigma/layer1/module/state"
	tb "sigma/sigma/layer1/module/toolbox"
	"sigma/sigma/utils/crypto"
	inputstopics "sigma/sigverse/inputs/topics"
	"sigma/sigverse/model"
	outputstopics "sigma/sigverse/outputs/topics"
	updatestopics "sigma/sigverse/updates/topics"
)

var sendTemplate = "topics/send"

type Actions struct {
	Layer abstract.ILayer
}

// Create /topics/create check [ true true false ] access [ true false false false POST ]
func (a *Actions) Create(s abstract.IState, input inputstopics.CreateInput) (any, error) {
	toolbox := abstract.UseToolbox[*tb.ToolboxL1](a.Layer.Tools())
	state := abstract.UseState[*modulestate.StateL1](s)
	state.Trx().Use()
	space := model.Space{Id: state.Info().SpaceId()}
	state.Trx().First(&space)
	topic := model.Topic{Id: crypto.SecureUniqueId(a.Layer.Core().Id()), Title: input.Title, Avatar: input.Avatar, SpaceId: space.Id}
	state.Trx().Create(&topic)
	toolbox.Cache().Put(fmt.Sprintf("city::%s", topic.Id), topic.SpaceId)
	go toolbox.Signaler().SignalGroup("topics/create", topic.SpaceId, updatestopics.Create{Topic: topic}, true, []string{state.Info().UserId()})
	return outputstopics.CreateOutput{Topic: topic}, nil
}

// Update /topics/update check [ true true false ] access [ true false false false PUT ]
func (a *Actions) Update(s abstract.IState, input inputstopics.UpdateInput) (any, error) {
	toolbox := abstract.UseToolbox[*tb.ToolboxL1](a.Layer.Tools())
	state := abstract.UseState[*modulestate.StateL1](s)
	state.Trx().Use()
	space := model.Space{Id: state.Info().SpaceId()}
	state.Trx().First(&space)
	topic := model.Topic{Id: input.TopicId}
	state.Trx().First(&topic)
	topic.Title = input.Title
	topic.Avatar = input.Avatar
	state.Trx().Save(&topic)
	go toolbox.Signaler().SignalGroup("topics/update", topic.SpaceId, updatestopics.Update{Topic: topic}, true, []string{state.Info().UserId()})
	return outputstopics.UpdateOutput{Topic: topic}, nil
}

// Delete /topics/delete check [ true true false ] access [ true false false false DELETE ]
func (a *Actions) Delete(s abstract.IState, input inputstopics.DeleteInput) (any, error) {
	toolbox := abstract.UseToolbox[*tb.ToolboxL1](a.Layer.Tools())
	state := abstract.UseState[*modulestate.StateL1](s)
	state.Trx().Use()
	space := model.Space{Id: state.Info().SpaceId()}
	state.Trx().First(&space)
	topic := model.Topic{Id: input.TopicId}
	err := state.Trx().First(&topic).Error()
	if err != nil {
		return nil, err
	}
	state.Trx().Delete(&topic)
	toolbox.Cache().Del(fmt.Sprintf("city::%s", topic.Id))
	go toolbox.Signaler().SignalGroup("topics/delete", topic.SpaceId, updatestopics.Delete{Topic: topic}, true, []string{state.Info().UserId()})
	return outputstopics.DeleteOutput{Topic: topic}, nil
}

// Get /topics/get check [ true true false ] access [ true false false false GET ]
func (a *Actions) Get(s abstract.IState, input inputstopics.GetInput) (any, error) {
	state := abstract.UseState[*modulestate.StateL1](s)
	state.Trx().Use()
	space := model.Space{Id: state.Info().SpaceId()}
	state.Trx().First(&space)
	topic := model.Topic{Id: input.TopicId}
	state.Trx().First(&topic)
	if space.IsPublic {
		return outputstopics.GetOutput{Topic: topic}, nil
	}
	member := model.Member{}
	err := state.Trx().Where("space_id = ?", space.Id).Where("user_id = ?", state.Info().UserId()).First(&member).Error()
	if err != nil {
		return nil, errors.New("access to space denied")
	}
	return outputstopics.GetOutput{Topic: topic}, nil
}

// Send /topics/send check [ true true true ] access [ true false false false POST ]
func (a *Actions) Send(s abstract.IState, input inputstopics.SendInput) (any, error) {
	toolbox := abstract.UseToolbox[*tb.ToolboxL1](a.Layer.Tools())
	state := abstract.UseState[*modulestate.StateL1](s)
	state.Trx().Use()
	if input.Type == "broadcast" {
		user := model.User{Id: state.Info().UserId()}
		state.Trx().First(&user)
		var p = updatestopics.Send{Action: "broadcast", User: user, Topic: model.Topic{SpaceId: state.Info().SpaceId(), Id: input.TopicId}, Data: input.Data}
		toolbox.Signaler().SignalGroup(sendTemplate, state.Info().SpaceId(), p, true, []string{state.Info().UserId()})
		return outputstopics.SendOutput{Passed: true}, nil
	} else if input.Type == "single" {
		memberData := toolbox.Cache().Get(fmt.Sprintf("member::%s::%s", state.Info().SpaceId(), input.RecvId))
		if memberData == "true" {
			user := model.User{Id: state.Info().UserId()}
			state.Trx().First(&user)
			var p = updatestopics.Send{Action: "single", User: user, Topic: model.Topic{SpaceId: state.Info().SpaceId(), Id: input.TopicId}, Data: input.Data}
			toolbox.Signaler().SignalUser(sendTemplate, "", input.RecvId, p, true)
			return outputstopics.SendOutput{Passed: true}, nil
		}
	}
	return outputstopics.SendOutput{Passed: false}, nil
}
