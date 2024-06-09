package actions_space

import (
	"errors"
	"fmt"
	"sigma/sigma/abstract"
	modulestate "sigma/sigma/layer1/module/state"
	tb "sigma/sigma/layer1/module/toolbox"
	"sigma/sigma/utils/crypto"
	inputsspaces "sigma/sigverse/inputs/spaces"
	models "sigma/sigverse/model"
	outputsspaces "sigma/sigverse/outputs/spaces"
	updatesspaces "sigma/sigverse/updates/spaces"
)

const memberTemplate = "member::%s::%s"

type Actions struct {
	Layer abstract.ILayer
}

// AddMember /spaces/addMember check [ true true false ] access [ true false false false POST ]
func (a *Actions) AddMember(s abstract.IState, input inputsspaces.AddMemberInput) (any, error) {
	toolbox := abstract.UseToolbox[*tb.ToolboxL1](a.Layer.Tools())
	state := abstract.UseState[*modulestate.StateL1](s)
	state.Trx().Use()
	err := state.Trx().First(&models.User{Id: input.UserId}).Error()
	if err != nil {
		return nil, err
	}
	member := models.Member{Id: crypto.SecureUniqueId(a.Layer.Core().Id()), UserId: input.UserId, SpaceId: state.Info().UserId(), TopicIds: "*", Metadata: ""}
	state.Trx().Create(&member)
	toolbox.Cache().Put(fmt.Sprintf(memberTemplate, member.SpaceId, member.UserId), "true")
	go toolbox.Signaler().SignalGroup("spaces/addMember", state.Info().SpaceId(), updatesspaces.AddMember{SpaceId: state.Info().SpaceId(), Member: member}, true, []string{state.Info().UserId()})
	return outputsspaces.AddMemberOutput{Member: member}, nil
}

// RemoveMember /spaces/removeMember check [ true true false ] access [ true false false false POST ]
func (a *Actions) RemoveMember(s abstract.IState, input inputsspaces.RemoveMemberInput) (any, error) {
	toolbox := abstract.UseToolbox[*tb.ToolboxL1](a.Layer.Tools())
	state := abstract.UseState[*modulestate.StateL1](s)
	state.Trx().Use()
	admin := models.Admin{}
	err := state.Trx().Where("space_id = ?", state.Info().SpaceId()).Where("user_id = ?", state.Info().UserId()).First(&admin).Error()
	if err != nil {
		return nil, err
	}
	member := models.Member{Id: input.MemberId}
	err2 := state.Trx().First(&member).Error()
	if err2 != nil {
		return nil, err2
	}
	state.Trx().Delete(&member)
	toolbox.Cache().Del(fmt.Sprintf(memberTemplate, member.SpaceId, member.UserId))
	go toolbox.Signaler().SignalGroup("spaces/removeMember", state.Info().SpaceId(), updatesspaces.AddMember{SpaceId: state.Info().SpaceId(), Member: member}, true, []string{state.Info().UserId()})
	return outputsspaces.AddMemberOutput{Member: member}, nil
}

// Create /spaces/create check [ true false false ] access [ true false false false POST ]
func (a *Actions) Create(s abstract.IState, input inputsspaces.CreateInput) (any, error) {
	toolbox := abstract.UseToolbox[*tb.ToolboxL1](a.Layer.Tools())
	state := abstract.UseState[*modulestate.StateL1](s)
	state.Trx().Use()
	space := models.Space{Id: crypto.SecureUniqueId(a.Layer.Core().Id()), Tag: input.Tag + "@" + a.Layer.Core().Id(), Title: input.Title, Avatar: input.Avatar, IsPublic: input.IsPublic}
	state.Trx().Create(&space)
	member := models.Member{Id: crypto.SecureUniqueId(a.Layer.Core().Id()), UserId: state.Info().UserId(), SpaceId: space.Id, TopicIds: "*", Metadata: ""}
	state.Trx().Create(&member)
	admin := models.Admin{Id: crypto.SecureUniqueId(a.Layer.Core().Id()), UserId: state.Info().UserId(), SpaceId: space.Id, Role: "creator"}
	state.Trx().Create(&admin)
	toolbox.Signaler().JoinGroup(member.SpaceId, member.UserId)
	toolbox.Cache().Put(fmt.Sprintf(memberTemplate, member.SpaceId, member.UserId), "true")
	return outputsspaces.CreateOutput{Space: space, Member: member}, nil
}

// Update /spaces/update check [ true false false ] access [ true false false false PUT ]
func (a *Actions) Update(s abstract.IState, input inputsspaces.UpdateInput) (any, error) {
	toolbox := abstract.UseToolbox[*tb.ToolboxL1](a.Layer.Tools())
	state := abstract.UseState[*modulestate.StateL1](s)
	state.Trx().Use()
	admin := models.Admin{}
	err := state.Trx().Where("user_id=?", state.Info().UserId()).Where("space_id=?", input.SpaceId).First(&admin).Error()
	if err != nil {
		return nil, err
	}
	space := models.Space{Id: input.SpaceId}
	state.Trx().First(&space)
	space.Title = input.Title
	space.Avatar = input.Avatar
	space.Tag = input.Tag + "@" + a.Layer.Core().Id()
	space.IsPublic = input.IsPublic
	state.Trx().Save(&space)
	go toolbox.Signaler().SignalGroup("spaces/update", space.Id, updatesspaces.Update{Space: space}, true, []string{state.Info().UserId()})
	return outputsspaces.UpdateOutput{Space: space}, nil
}

// Delete /spaces/delete check [ true false false ] access [ true false false false DELETE ]
func (a *Actions) Delete(s abstract.IState, input inputsspaces.DeleteInput) (any, error) {
	toolbox := abstract.UseToolbox[*tb.ToolboxL1](a.Layer.Tools())
	state := abstract.UseState[*modulestate.StateL1](s)
	state.Trx().Use()
	admin := models.Admin{}
	err := state.Trx().Where("user_id=?", state.Info().UserId()).Where("space_id=?", input.SpaceId).First(&admin).Error()
	if err != nil {
		return nil, err
	}
	if admin.Role != "creator" {
		return nil, errors.New("you are not the space creator")
	}
	space := models.Space{Id: input.SpaceId}
	err2 := state.Trx().First(&space).Error()
	if err2 != nil {
		return nil, err2
	}
	state.Trx().Delete(&space)
	go toolbox.Signaler().SignalGroup("spaces/delete", space.Id, updatesspaces.Delete{Space: space}, true, []string{state.Info().UserId()})
	return outputsspaces.DeleteOutput{Space: space}, nil
}

// Get /spaces/get check [ true false false ] access [ true false false false GET ]
func (a *Actions) Get(s abstract.IState, input inputsspaces.GetInput) (any, error) {
	state := abstract.UseState[*modulestate.StateL1](s)
	state.Trx().Use()
	space := models.Space{Id: input.SpaceId}
	state.Trx().First(&space)
	if space.IsPublic {
		return outputsspaces.GetOutput{Space: space}, nil
	}
	member := models.Member{}
	err := state.Trx().Where("space_id = ?", input.SpaceId).Where("user_id = ?", state.Info().UserId()).First(&member).Error()
	if err != nil {
		return nil, errors.New("space not found")
	}
	return outputsspaces.GetOutput{Space: space}, nil
}

// Join /spaces/join check [ true false false ] access [ true false false false POST ]
func (a *Actions) Join(s abstract.IState, input inputsspaces.JoinInput) (any, error) {
	toolbox := abstract.UseToolbox[*tb.ToolboxL1](a.Layer.Tools())
	state := abstract.UseState[*modulestate.StateL1](s)
	state.Trx().Use()
	space := models.Space{Id: input.SpaceId}
	err := state.Trx().First(&space).Error()
	if err != nil {
		return nil, err
	}
	if !space.IsPublic {
		return nil, errors.New("access to private space denied")
	}
	member := models.Member{Id: crypto.SecureUniqueId(a.Layer.Core().Id()), UserId: state.Info().UserId(), SpaceId: input.SpaceId, TopicIds: "*", Metadata: ""}
	err2 := state.Trx().Create(&member).Error()
	if err2 != nil {
		return nil, err2
	}
	toolbox.Signaler().JoinGroup(member.SpaceId, member.UserId)
	toolbox.Cache().Put(fmt.Sprintf(memberTemplate, member.SpaceId, member.UserId), "true")
	go toolbox.Signaler().SignalGroup("spaces/join", member.SpaceId, updatesspaces.Join{Member: member}, true, []string{member.UserId})
	return outputsspaces.JoinOutput{Member: member}, nil
}
