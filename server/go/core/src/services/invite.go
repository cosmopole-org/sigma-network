package services

import (
	"context"
	"fmt"
	dtos_invites "sigma/core/src/dtos/invites"
	"sigma/core/src/interfaces"
	"sigma/core/src/models"
	outputs_invites "sigma/core/src/outputs/invites"
	"sigma/core/src/types"
	updates_invites "sigma/core/src/updates/invites"
	"sigma/core/src/utils"
)

func createInvite(app interfaces.IApp, dto interface{}, assistant interfaces.IAssistant) (any, error) {
	var input = (dto).(*dtos_invites.CreateDto)
	var query = `
		insert into invite
		(
			human_id,
			tower_id
		) values ($1, $2)
		returning id, human_id, tower_id;
	`
	var invite models.Invite
	if err := app.GetDatabase().GetDb().QueryRow(
		context.Background(), query, input.HumanId, assistant.GetTowerId(),
	).Scan(&invite.Id, &invite.HumanId, &invite.TowerId); err != nil {
		fmt.Println(err)
		return outputs_invites.CreateOutput{}, err
	}
	go app.GetNetwork().GetPusherServer().PushToUser(input.HumanId, updates_invites.Create{Invite: invite})
	return outputs_invites.CreateOutput{Invite: invite}, nil
}

func cancelInvite(app interfaces.IApp, dto interface{}, assistant interfaces.IAssistant) (any, error) {
	var input = (dto).(*dtos_invites.CancelDto)
	var query = `
		delete from invite where id = $1 and tower_id = $2
		returning id, human_id, tower_id;
	`
	var invite models.Invite
	if err := app.GetDatabase().GetDb().QueryRow(
		context.Background(), query, input.InviteId, assistant.GetTowerId(),
	).Scan(&invite.Id, &invite.HumanId, &invite.TowerId); err != nil {
		fmt.Println(err)
		return outputs_invites.CancelOutput{}, err
	}
	go app.GetNetwork().GetPusherServer().PushToUser(invite.HumanId, updates_invites.Cancel{Invite: invite})
	return outputs_invites.CancelOutput{}, nil
}

func acceptInvite(app interfaces.IApp, dto interface{}, assistant interfaces.IAssistant) (any, error) {
	var input = (dto).(*dtos_invites.AcceptDto)
	var query = `
		select * from invites_accept($1, $2)
	`
	var member models.Member
	if err := app.GetDatabase().GetDb().QueryRow(
		context.Background(), query, assistant.GetUserId(), input.InviteId,
	).Scan(&member.Id, &member.HumanId, &member.TowerId); err != nil {
		fmt.Println(err)
		return outputs_invites.AcceptOutput{}, err
	}
	var invite = models.Invite{Id: input.InviteId, HumanId: member.HumanId, TowerId: member.TowerId}
	go app.GetNetwork().GetPusherServer().PushToUser(invite.HumanId, updates_invites.Accept{Invite: invite})
	return outputs_invites.AcceptOutput{Member: member}, nil
}

func declineInvite(app interfaces.IApp, dto interface{}, assistant interfaces.IAssistant) (any, error) {
	var input = (dto).(*dtos_invites.DeclineDto)
	var query = `
		delete from invite where id = $1 and human_id = $2
		returning id, human_id, tower_id
	`
	var invite models.Invite
	if err := app.GetDatabase().GetDb().QueryRow(
		context.Background(), query, input.InviteId, assistant.GetUserId(),
	).Scan(&invite.Id, &invite.HumanId, &invite.TowerId); err != nil {
		fmt.Println(err)
		return outputs_invites.DeclineOutput{}, err
	}
	go app.GetNetwork().GetPusherServer().PushToUser(invite.HumanId, updates_invites.Decline{Invite: invite})
	return outputs_invites.DeclineOutput{}, nil
}

func CreateInviteService(app interfaces.IApp) interfaces.IService {

	// Tables
	utils.ExecuteSqlFile("src/database/tables/invite.sql")

	// Functions
	utils.ExecuteSqlFile("src/database/functions/invites/accept.sql")

	var s = types.CreateService(app, "invites")
	s.AddMethod(types.CreateMethod("create", createInvite, types.CreateCheck(true, true, false), dtos_invites.CreateDto{}, types.CreateMethodOptions(true, false)))
	s.AddMethod(types.CreateMethod("cancel", cancelInvite, types.CreateCheck(true, true, false), dtos_invites.CancelDto{}, types.CreateMethodOptions(true, false)))
	s.AddMethod(types.CreateMethod("accept", acceptInvite, types.CreateCheck(true, false, false), dtos_invites.AcceptDto{}, types.CreateMethodOptions(true, false)))
	s.AddMethod(types.CreateMethod("decline", declineInvite, types.CreateCheck(true, false, false), dtos_invites.DeclineDto{}, types.CreateMethodOptions(true, false)))

	return s
}
