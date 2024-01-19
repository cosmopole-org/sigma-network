package controllers

import (
	"sigma/core/src/interfaces"
	"sigma/core/src/types"
	"sigma/core/src/utils"

	"github.com/valyala/fasthttp"
)

func signup(app *interfaces.IApp, p interfaces.IPacket, dto interfaces.IDto, guard interfaces.IGuard) {
	wp := p.(types.WebPacket)
	result, err := (*app).GetService("humans").CallMethod(app, "signup", dto, guard)
	if (err != nil) {
		wp.AnswerWithJson(fasthttp.StatusInternalServerError, map[string]string{}, utils.BuildErrorJson(err.Error()))
	} else {
		wp.AnswerWithJson(fasthttp.StatusOK, map[string]string{}, result)
	}
}

func verify(app *interfaces.IApp, p interfaces.IPacket, dto interfaces.IDto, guard interfaces.IGuard) {
	wp := p.(types.WebPacket)
	result, err := (*app).GetService("humans").CallMethod(app, "verify", dto, guard)
	if (err != nil) {
		wp.AnswerWithJson(fasthttp.StatusInternalServerError, map[string]string{}, utils.BuildErrorJson(err.Error()))
	} else {
		wp.AnswerWithJson(fasthttp.StatusOK, map[string]string{}, result)
	}
}

func complete(app *interfaces.IApp, p interfaces.IPacket, dto interfaces.IDto, guard interfaces.IGuard) {
	wp := p.(types.WebPacket)
	result, err := (*app).GetService("humans").CallMethod(app, "complete", dto, guard)
	if (err != nil) {
		wp.AnswerWithJson(fasthttp.StatusInternalServerError, map[string]string{}, utils.BuildErrorJson(err.Error()))
	} else {
		wp.AnswerWithJson(fasthttp.StatusOK, map[string]string{}, result)
	}
}

func update(app *interfaces.IApp, p interfaces.IPacket, dto interfaces.IDto, guard interfaces.IGuard) {
	wp := p.(types.WebPacket)
	result, err := (*app).GetService("humans").CallMethod(app, "update", dto, guard)
	if (err != nil) {
		wp.AnswerWithJson(fasthttp.StatusInternalServerError, map[string]string{}, utils.BuildErrorJson(err.Error()))
	} else {
		wp.AnswerWithJson(fasthttp.StatusOK, map[string]string{}, result)
	}
}

func get(app *interfaces.IApp, p interfaces.IPacket, dto interfaces.IDto, guard interfaces.IGuard) {
	wp := p.(types.WebPacket)
	result, err := (*app).GetService("humans").CallMethod(app, "get", dto, guard)
	if (err != nil) {
		wp.AnswerWithJson(fasthttp.StatusInternalServerError, map[string]string{}, utils.BuildErrorJson(err.Error()))
	} else {
		wp.AnswerWithJson(fasthttp.StatusOK, map[string]string{}, result)
	}
}

func CreateHumanController(app *interfaces.IApp) interfaces.IController {

	// Tables
	utils.ExecuteSqlFile("src/database/tables/session.sql")
	utils.ExecuteSqlFile("src/database/tables/pending.sql")
	utils.ExecuteSqlFile("src/database/tables/human.sql")

	// Functipns
	utils.ExecuteSqlFile("src/database/functions/humans/complete.sql")
	utils.ExecuteSqlFile("src/database/functions/humans/verify.sql")

	return types.CreateController("humans", (*app).GetService("humans")).
		AddEndpoint(types.CreateEndpoint("signup", "humans", "signup", signup)).
		AddEndpoint(types.CreateEndpoint("verify", "humans", "verify", verify)).
		AddEndpoint(types.CreateEndpoint("complete", "humans", "complete", complete)).
		AddEndpoint(types.CreateEndpoint("update", "humans", "update", update)).
		AddEndpoint(types.CreateEndpoint("get", "humans", "get", get))
}
