package services

import (
	"context"
	"fmt"
	dtos_invites "sigma/core/src/dtos/invites"
	"sigma/core/src/interfaces"
	"sigma/core/src/models"
	outputs_invites "sigma/core/src/outputs/invites"
	"sigma/core/src/types"
	"sigma/core/src/utils"

	"github.com/valyala/fasthttp"
)

func createInvite(app *interfaces.IApp, p interfaces.IPacket, dto interfaces.IDto, guard interfaces.IGuard) {
	var packet = p.(types.WebPacket)
	var query = `
		insert into invite
		(
			human_id,
			tower_id
		) values ($1, $2)
		returning id, human_id, tower_id;
	`
	var invite models.Invite
	if err := (*app).GetDatabase().GetDb().QueryRow(
		context.Background(), query, guard.GetUserId(), guard.GetTowerId(),
	).Scan(&invite.Id, &invite.HumanId, &invite.TowerId); err != nil {
		fmt.Println(err)
		packet.AnswerWithJson(fasthttp.StatusInternalServerError, map[string]string{}, utils.BuildErrorJson(err.Error()))
		return
	}
	packet.AnswerWithJson(fasthttp.StatusOK, map[string]string{}, outputs_invites.CreateOutput{Invite: invite})
}

func cancelInvite(app *interfaces.IApp, p interfaces.IPacket, dto interfaces.IDto, guard interfaces.IGuard) {
	var input = dto.(*dtos_invites.CancelDto)
	var packet = p.(types.WebPacket)
	var query = `
		delete from invite where id = $1 and tower_id = $2;
	`
	_, err := (*app).GetDatabase().GetDb().Exec(context.Background(), query, input.InviteId, guard.GetTowerId())
	if err != nil {
		fmt.Println(err)
		packet.AnswerWithJson(fasthttp.StatusInternalServerError, map[string]string{}, utils.BuildErrorJson(err.Error()))
		return
	}
	packet.AnswerWithJson(fasthttp.StatusOK, map[string]string{}, outputs_invites.CancelOutput{})
}

func acceptInvite(app *interfaces.IApp, p interfaces.IPacket, dto interfaces.IDto, guard interfaces.IGuard) {
	var input = dto.(*dtos_invites.AcceptDto)
	var packet = p.(types.WebPacket)
	var query = `
		select * from invites_accept($1, $2)
	`
	var member models.Member
	if err := (*app).GetDatabase().GetDb().QueryRow(
		context.Background(), query, guard.GetUserId(), input.InviteId,
	).Scan(&member.Id, &member.HumanId, &member.TowerId); err != nil {
		fmt.Println(err)
		packet.AnswerWithJson(fasthttp.StatusInternalServerError, map[string]string{}, utils.BuildErrorJson(err.Error()))
		return
	}
	packet.AnswerWithJson(fasthttp.StatusOK, map[string]string{}, outputs_invites.AcceptOutput{Member: member})
}

func declineInvite(app *interfaces.IApp, p interfaces.IPacket, dto interfaces.IDto, guard interfaces.IGuard) {
	var input = dto.(*dtos_invites.DeclineDto)
	var packet = p.(types.WebPacket)
	var query = `
		delete from invite where id = $1 and human_id = $2
	`
	_, err := (*app).GetDatabase().GetDb().Exec(
		context.Background(), query, input.InviteId, guard.GetUserId(),
	)
	if (err != nil) {
		fmt.Println(err)
		packet.AnswerWithJson(fasthttp.StatusInternalServerError, map[string]string{}, utils.BuildErrorJson(err.Error()))
		return
	}
	packet.AnswerWithJson(fasthttp.StatusOK, map[string]string{}, outputs_invites.DeclineOutput{})
}

func CreateInviteService(app *interfaces.IApp) interfaces.IService {

	// Tables
	utils.ExecuteSqlFile("src/database/tables/invite.sql")

	// Functions
	utils.ExecuteSqlFile("src/database/functions/invites/accept.sql")

	return types.CreateService("invites").
		AddMethod(types.CreateMethod("create", createInvite, types.CreateCheck(true, true, false), &dtos_invites.CreateDto{})).
		AddMethod(types.CreateMethod("cancel", cancelInvite, types.CreateCheck(true, true, false), &dtos_invites.CancelDto{})).
		AddMethod(types.CreateMethod("accept", acceptInvite, types.CreateCheck(true, false, false), &dtos_invites.AcceptDto{})).
		AddMethod(types.CreateMethod("decline", declineInvite, types.CreateCheck(true, false, false), &dtos_invites.DeclineDto{}))
}
