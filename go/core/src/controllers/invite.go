package controllers

import (
	"sigma/core/src/interfaces"
	"sigma/core/src/types"
	"sigma/core/src/utils"

	"github.com/valyala/fasthttp"
)

func createInvite(app *interfaces.IApp, p interfaces.IPacket, dto interfaces.IDto, guard interfaces.IGuard) {
	wp := p.(types.WebPacket)
	result, err := (*app).GetService("invites").CallMethod(app, "create", dto, guard)
	if (err != nil) {
		wp.AnswerWithJson(fasthttp.StatusInternalServerError, map[string]string{}, utils.BuildErrorJson(err.Error()))
	} else {
		wp.AnswerWithJson(fasthttp.StatusOK, map[string]string{}, result)
	}
}

func cancelInvite(app *interfaces.IApp, p interfaces.IPacket, dto interfaces.IDto, guard interfaces.IGuard) {
	wp := p.(types.WebPacket)
	result, err := (*app).GetService("invites").CallMethod(app, "cancel", dto, guard)
	if (err != nil) {
		wp.AnswerWithJson(fasthttp.StatusInternalServerError, map[string]string{}, utils.BuildErrorJson(err.Error()))
	} else {
		wp.AnswerWithJson(fasthttp.StatusOK, map[string]string{}, result)
	}
}

func acceptInvite(app *interfaces.IApp, p interfaces.IPacket, dto interfaces.IDto, guard interfaces.IGuard) {
	wp := p.(types.WebPacket)
	result, err := (*app).GetService("invites").CallMethod(app, "accept", dto, guard)
	if (err != nil) {
		wp.AnswerWithJson(fasthttp.StatusInternalServerError, map[string]string{}, utils.BuildErrorJson(err.Error()))
	} else {
		wp.AnswerWithJson(fasthttp.StatusOK, map[string]string{}, result)
	}
}

func declineInvite(app *interfaces.IApp, p interfaces.IPacket, dto interfaces.IDto, guard interfaces.IGuard) {
	wp := p.(types.WebPacket)
	result, err := (*app).GetService("invites").CallMethod(app, "decline", dto, guard)
	if (err != nil) {
		wp.AnswerWithJson(fasthttp.StatusInternalServerError, map[string]string{}, utils.BuildErrorJson(err.Error()))
	} else {
		wp.AnswerWithJson(fasthttp.StatusOK, map[string]string{}, result)
	}
}

func CreateInviteController(app *interfaces.IApp) interfaces.IController {

	// Tables
	utils.ExecuteSqlFile("src/database/tables/invite.sql")

	// Functions
	utils.ExecuteSqlFile("src/database/functions/invites/accept.sql")

	return types.CreateController("invites", (*app).GetService("invites")).
		AddEndpoint(types.CreateEndpoint("create", "invites", "create", createInvite)).
		AddEndpoint(types.CreateEndpoint("cancel", "invites", "cancel", cancelInvite)).
		AddEndpoint(types.CreateEndpoint("accept", "invites", "accept", acceptInvite)).
		AddEndpoint(types.CreateEndpoint("decline", "invites", "decline", declineInvite))
}
