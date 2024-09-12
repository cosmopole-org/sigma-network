package actions_invite

import (
	"errors"
	"fmt"
	inputs_invites "sigma/main/core/inputs/invites"
	"sigma/main/core/models"
	outputs_invites "sigma/main/core/outputs/invites"
	"sigma/main/core/runtime"
	updates_invites "sigma/main/core/updates/invites"
	"sigma/main/core/utils"
)

const inviteNotFoundError = "invite not found"

var memberTemplate = "member::%s::%s"

type InviteActions struct {
	App *runtime.App
}

// Create /invites/create check [ true true false ] access [ true false false false POST ]
func (a *InviteActions) Create(state sigmastate.ISigmaStatePool, input inputs_invites.CreateInput, info models.Info) (any, error) {
	space := models.Space{Id: input.SpaceId}
	err := context.Trx.First(&space).Error()
	if err != nil {
		return nil, err
	}
	invite := models.Invite{Id: utils.SecureUniqueId(context.AppId), UserId: input.UserId, SpaceId: input.SpaceId}
	err2 := context.Trx.Create(&invite).Error()
	if err2 != nil {
		return nil, err2
	}
	go context.Signaler().SignalUser("invites/create", "", input.UserId, updates_invites.Create{Invite: invite}, true)
	return outputs_invites.CreateOutput{Invite: invite}, nil
}

// Cancel /invites/cancel check [ true true false ] access [ true false false false POST ]
func (a *InviteActions) Cancel(state sigmastate.ISigmaStatePool, input inputs_invites.CancelInput, info models.Info) (any, error) {
	admin := models.Admin{UserId: info.User.Id, SpaceId: input.SpaceId}
	err := context.Trx.First(&admin).Error()
	if err != nil {
		return nil, err
	}
	invite := models.Invite{Id: input.InviteId}
	err2 := context.Trx.First(&invite).Error()
	if err2 != nil {
		return nil, err2
	}
	if invite.SpaceId != input.SpaceId {
		return nil, errors.New(inviteNotFoundError)
	}
	err3 := context.Trx.Delete(&invite).Error()
	if err3 != nil {
		return nil, err3
	}
	go context.Signaler().SignalUser("invites/cancel", "", invite.UserId, updates_invites.Cancel{Invite: invite}, true)
	return outputs_invites.CancelOutput{Invite: invite}, nil
}

// Accept /invites/accept check [ true false false ] access [ true false false false POST ]
func (a *InviteActions) Accept(state sigmastate.ISigmaStatePool, input inputs_invites.AcceptInput, info models.Info) (any, error) {
	invite := models.Invite{Id: input.InviteId}
	err := context.Trx.First(&invite).Error()
	if err != nil {
		return nil, err
	}
	if invite.UserId != info.User.Id {
		return nil, errors.New(inviteNotFoundError)
	}
	err2 := context.Trx.Delete(&invite).Error()
	if err2 != nil {
		return nil, err2
	}
	member := models.Member{Id: utils.SecureUniqueId(context.AppId), UserId: invite.UserId, SpaceId: invite.SpaceId, TopicIds: "*", Metadata: ""}
	context.Trx.Create(&member)
	context.Signaler().JoinGroup(member.SpaceId, member.UserId)
	context.Adapters().Cache().Put(fmt.Sprintf(memberTemplate, member.SpaceId, member.UserId), "true")
	admins := []models.Admin{}
	context.Trx.Where("space_id = ?", invite.SpaceId).Find(&admins)
	for _, admin := range admins {
		go context.Signaler().SignalUser("invites/accept", "", admin.UserId, updates_invites.Accept{Invite: invite}, true)
	}
	go context.Signaler().SignalGroup("spaces/userJoined", invite.SpaceId, updates_invites.Accept{Invite: invite}, true, []string{})
	return outputs_invites.AcceptOutput{Member: member}, nil
}

// Decline /invites/decline check [ true false false ] access [ true false false false POST ]
func (a *InviteActions) Decline(state sigmastate.ISigmaStatePool, input inputs_invites.DeclineInput, info models.Info) (any, error) {
	invite := models.Invite{Id: input.InviteId}
	err := context.Trx.First(&invite).Error()
	if err != nil {
		return nil, err
	}
	if invite.UserId != info.User.Id {
		return nil, errors.New(inviteNotFoundError)
	}
	err2 := context.Trx.Delete(&invite).Error()
	if err2 != nil {
		return nil, err2
	}
	admins := []models.Admin{}
	context.Trx.Where("space_id = ?", invite.SpaceId).Find(&admins)
	for _, admin := range admins {
		go context.Signaler().SignalUser("invites/accept", "", admin.UserId, updates_invites.Accept{Invite: &invite}, true)
	}
	return outputs_invites.DeclineOutput{}, nil
}
