package services_invite

import (
	"errors"
	"fmt"
	inputs_invites "sigma/storage/core/inputs/invites"
	"sigma/storage/core/models"
	outputs_invites "sigma/storage/core/outputs/invites"
	"sigma/storage/core/runtime"
	updates_invites "sigma/storage/core/updates/invites"
	"sigma/storage/core/utils"
)

const inviteNotFoundError = "invite not found"
var memberTemplate = "member::%s::%s"

// Create /invites/create check [ true true false ] access [ true false false false POST ]
func Create(control *runtime.Control, input inputs_invites.CreateInput, info models.Info) (any, error) {
	space := models.Space{Id: input.SpaceId}
	err := control.Trx.First(&space).Error()
	if err != nil {
		return nil, err
	}
	invite := models.Invite{Id: utils.SecureUniqueId(control.AppId), UserId: input.UserId, SpaceId: input.SpaceId}
	err2 := control.Trx.Create(&invite).Error()
	if err2 != nil {
		return nil, err2
	}
	go control.Signaler().SignalUser("invites/create", "", input.UserId, updates_invites.Create{Invite: invite}, true)
	return outputs_invites.CreateOutput{Invite: invite}, nil
}

// Cancel /invites/cancel check [ true true false ] access [ true false false false POST ]
func Cancel(control *runtime.Control, input inputs_invites.CancelInput, info models.Info) (any, error) {
	admin := models.Admin{UserId: info.User.Id, SpaceId: input.SpaceId}
	err := control.Trx.First(&admin).Error()
	if err != nil {
		return nil, err
	}
	invite := models.Invite{Id: input.InviteId}
	err2 := control.Trx.First(&invite).Error()
	if err2 != nil {
		return nil, err2
	}
	if invite.SpaceId != input.SpaceId {
		return nil, errors.New(inviteNotFoundError)
	}
	err3 := control.Trx.Delete(&invite).Error()
	if err3 != nil {
		return nil, err3
	}
	go control.Signaler().SignalUser("invites/cancel", "", invite.UserId, updates_invites.Cancel{Invite: invite}, true)
	return outputs_invites.CancelOutput{Invite: invite}, nil
}

// Accept /invites/accept check [ true false false ] access [ true false false false POST ]
func Accept(control *runtime.Control, input inputs_invites.AcceptInput, info models.Info) (any, error) {
	invite := models.Invite{Id: input.InviteId}
	err := control.Trx.First(&invite).Error()
	if err != nil {
		return nil, err
	}
	if invite.UserId != info.User.Id {
		return nil, errors.New(inviteNotFoundError)
	}
	err2 := control.Trx.Delete(&invite).Error()
	if err2 != nil {
		return nil, err2
	}
	member := models.Member{Id: utils.SecureUniqueId(control.AppId), UserId: invite.UserId, SpaceId: invite.SpaceId, TopicIds: "*", Metadata: ""}
	control.Trx.Create(&member)
	control.Signaler().JoinGroup(member.SpaceId, member.UserId)
	control.Adapters().Cache().Put(fmt.Sprintf(memberTemplate, member.SpaceId, member.UserId), "true")
	admins := []models.Admin{}
	control.Trx.Where("space_id = ?", invite.SpaceId).Find(&admins)
	for _, admin := range admins {
		go control.Signaler().SignalUser("invites/accept", "", admin.UserId, updates_invites.Accept{Invite: invite}, true)
	}
	go control.Signaler().SignalGroup("spaces/userJoined", invite.SpaceId, updates_invites.Accept{Invite: invite}, true, []string{})
	return outputs_invites.AcceptOutput{Member: member}, nil
}

// Decline /invites/decline check [ true false false ] access [ true false false false POST ]
func Decline(control *runtime.Control, input inputs_invites.DeclineInput, info models.Info) (any, error) {
	invite := models.Invite{Id: input.InviteId}
	err := control.Trx.First(&invite).Error()
	if err != nil {
		return nil, err
	}
	if invite.UserId != info.User.Id {
		return nil, errors.New(inviteNotFoundError)
	}
	err2 := control.Trx.Delete(&invite).Error()
	if err2 != nil {
		return nil, err2
	}
	admins := []models.Admin{}
	control.Trx.Where("space_id = ?", invite.SpaceId).Find(&admins)
	for _, admin := range admins {
		go control.Signaler().SignalUser("invites/accept", "", admin.UserId, updates_invites.Accept{Invite: &invite}, true)
	}
	return outputs_invites.DeclineOutput{}, nil
}
