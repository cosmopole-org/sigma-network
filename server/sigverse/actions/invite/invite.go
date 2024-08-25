package actions_invite

import (
	"errors"
	"fmt"
	"sigma/sigma/abstract"
	modulestate "sigma/sigma/layer1/module/state"
	toolbox2 "sigma/sigma/layer1/module/toolbox"
	"sigma/sigma/utils/crypto"
	inputsinvites "sigma/sigverse/inputs/invites"
	"sigma/sigverse/model"
	outputsinvites "sigma/sigverse/outputs/invites"
	updatesinvites "sigma/sigverse/updates/invites"
)

const inviteNotFoundError = "invite not found"

var memberTemplate = "member::%s::%s"

type Actions struct {
	Layer abstract.ILayer
}

func Install(s abstract.IState, a *Actions) error {
	state := abstract.UseToolbox[modulestate.IStateL1](s)
	return state.Trx().AutoMigrate(&model.Invite{})
}

// Create /invites/create check [ true true false ] access [ true false false false POST ]
func (a *Actions) Create(s abstract.IState, input inputsinvites.CreateInput) (any, error) {
	toolbox := abstract.UseToolbox[*toolbox2.ToolboxL1](a.Layer.Tools())
	state := abstract.UseState[modulestate.IStateL1](s)
	var invite model.Invite
	trx := state.Trx()
	trx.Use()
	space := model.Space{Id: input.SpaceId}
	err := trx.First(&space).Error()
	if err != nil {
		return nil, err
	}
	invite = model.Invite{Id: crypto.SecureUniqueId(a.Layer.Core().Id()), UserId: input.UserId, SpaceId: input.SpaceId}
	err2 := trx.Create(&invite).Error()
	if err2 != nil {
		return nil, err2
	}
	go toolbox.Signaler().SignalUser("invites/create", "", input.UserId, updatesinvites.Create{Invite: invite}, true)
	return outputsinvites.CreateOutput{Invite: invite}, nil
}

// Cancel /invites/cancel check [ true true false ] access [ true false false false POST ]
func (a *Actions) Cancel(s abstract.IState, input inputsinvites.CancelInput) (any, error) {
	toolbox := abstract.UseToolbox[*toolbox2.ToolboxL1](a.Layer.Tools())
	state := abstract.UseState[modulestate.IStateL1](s)
	var invite model.Invite
	trx := state.Trx()
	trx.Use()
	admin := model.Admin{UserId: state.Info().UserId(), SpaceId: input.SpaceId}
	err := trx.First(&admin).Error()
	if err != nil {
		return nil, err
	}
	invite = model.Invite{Id: input.InviteId}
	err2 := trx.First(&invite).Error()
	if err2 != nil {
		return nil, err2
	}
	if invite.SpaceId != input.SpaceId {
		return nil, errors.New(inviteNotFoundError)
	}
	err3 := trx.Delete(&invite).Error()
	if err3 != nil {
		return nil, err3
	}
	go toolbox.Signaler().SignalUser("invites/cancel", "", invite.UserId, updatesinvites.Cancel{Invite: invite}, true)
	return outputsinvites.CancelOutput{Invite: invite}, nil
}

// Accept /invites/accept check [ true false false ] access [ true false false false POST ]
func (a *Actions) Accept(s abstract.IState, input inputsinvites.AcceptInput) (any, error) {
	toolbox := abstract.UseToolbox[*toolbox2.ToolboxL1](a.Layer.Tools())
	state := abstract.UseState[modulestate.IStateL1](s)
	var member model.Member
	trx := state.Trx()
	trx.Use()
	invite := model.Invite{Id: input.InviteId}
	err := trx.First(&invite).Error()
	if err != nil {
		return nil, err
	}
	if invite.UserId != state.Info().UserId() {
		return nil, errors.New(inviteNotFoundError)
	}
	err2 := trx.Delete(&invite).Error()
	if err2 != nil {
		return nil, err2
	}
	member = model.Member{Id: crypto.SecureUniqueId(a.Layer.Core().Id()), UserId: invite.UserId, SpaceId: invite.SpaceId, TopicId: "*", Metadata: ""}
	err3 := trx.Create(&member).Error()
	if err3 != nil {
		return nil, err3
	}
	toolbox.Signaler().JoinGroup(member.SpaceId, member.UserId)
	toolbox.Cache().Put(fmt.Sprintf(memberTemplate, member.SpaceId, member.UserId), "true")
	var admins []model.Admin
	err4 := trx.Where("space_id = ?", invite.SpaceId).Find(&admins).Error()
	if err4 != nil {
		return nil, err4
	}
	for _, admin := range admins {
		go toolbox.Signaler().SignalUser("invites/accept", "", admin.UserId, updatesinvites.Accept{Invite: invite}, true)
	}
	go toolbox.Signaler().SignalGroup("spaces/userJoined", invite.SpaceId, updatesinvites.Accept{Invite: invite}, true, []string{})
	return outputsinvites.AcceptOutput{Member: member}, nil
}

// Decline /invites/decline check [ true false false ] access [ true false false false POST ]
func (a *Actions) Decline(s abstract.IState, input inputsinvites.DeclineInput) (any, error) {
	toolbox := abstract.UseToolbox[*toolbox2.ToolboxL1](a.Layer.Tools())
	state := abstract.UseState[modulestate.IStateL1](s)
	trx := state.Trx()
	trx.Use()
	invite := model.Invite{Id: input.InviteId}
	err := trx.First(&invite).Error()
	if err != nil {
		return nil, err
	}
	if invite.UserId != state.Info().UserId() {
		return nil, errors.New(inviteNotFoundError)
	}
	err2 := trx.Delete(&invite).Error()
	if err2 != nil {
		return nil, err2
	}
	var admins []model.Admin
	err3 := trx.Where("space_id = ?", invite.SpaceId).Find(&admins).Error()
	if err3 != nil {
		return nil, err3
	}
	for _, admin := range admins {
		go toolbox.Signaler().SignalUser("invites/accept", "", admin.UserId, updatesinvites.Accept{Invite: &invite}, true)
	}
	return outputsinvites.DeclineOutput{}, nil
}
