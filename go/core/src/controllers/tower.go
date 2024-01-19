package controllers

import (
	"sigma/core/src/interfaces"
	"sigma/core/src/types"
	"sigma/core/src/utils"

	"github.com/valyala/fasthttp"
)

func createTower(app *interfaces.IApp, p interfaces.IPacket, dto interfaces.IDto, guard interfaces.IGuard) {
	wp := p.(types.WebPacket)
	result, err := (*app).GetService("towers").CallMethod(app, "create", dto, guard)
	if (err != nil) {
		wp.AnswerWithJson(fasthttp.StatusInternalServerError, map[string]string{}, utils.BuildErrorJson(err.Error()))
	} else {
		wp.AnswerWithJson(fasthttp.StatusOK, map[string]string{}, result)
	}
}

func updateTower(app *interfaces.IApp, p interfaces.IPacket, dto interfaces.IDto, guard interfaces.IGuard) {
	wp := p.(types.WebPacket)
	result, err := (*app).GetService("towers").CallMethod(app, "update", dto, guard)
	if (err != nil) {
		wp.AnswerWithJson(fasthttp.StatusInternalServerError, map[string]string{}, utils.BuildErrorJson(err.Error()))
	} else {
		wp.AnswerWithJson(fasthttp.StatusOK, map[string]string{}, result)
	}
}

func deleteTower(app *interfaces.IApp, p interfaces.IPacket, dto interfaces.IDto, guard interfaces.IGuard) {
	wp := p.(types.WebPacket)
	result, err := (*app).GetService("towers").CallMethod(app, "delete", dto, guard)
	if (err != nil) {
		wp.AnswerWithJson(fasthttp.StatusInternalServerError, map[string]string{}, utils.BuildErrorJson(err.Error()))
	} else {
		wp.AnswerWithJson(fasthttp.StatusOK, map[string]string{}, result)
	}
}

func getTower(app *interfaces.IApp, p interfaces.IPacket, dto interfaces.IDto, guard interfaces.IGuard) {
	wp := p.(types.WebPacket)
	result, err := (*app).GetService("towers").CallMethod(app, "get", dto, guard)
	if (err != nil) {
		wp.AnswerWithJson(fasthttp.StatusInternalServerError, map[string]string{}, utils.BuildErrorJson(err.Error()))
	} else {
		wp.AnswerWithJson(fasthttp.StatusOK, map[string]string{}, result)
	}
}

func joinTower(app *interfaces.IApp, p interfaces.IPacket, dto interfaces.IDto, guard interfaces.IGuard) {
	wp := p.(types.WebPacket)
	result, err := (*app).GetService("towers").CallMethod(app, "join", dto, guard)
	if (err != nil) {
		wp.AnswerWithJson(fasthttp.StatusInternalServerError, map[string]string{}, utils.BuildErrorJson(err.Error()))
	} else {
		wp.AnswerWithJson(fasthttp.StatusOK, map[string]string{}, result)
	}
}

func CreateTowerController(app *interfaces.IApp) interfaces.IController {

	// Tables
	utils.ExecuteSqlFile("src/database/tables/tower.sql")
	utils.ExecuteSqlFile("src/database/tables/member.sql")

	// Functions
	utils.ExecuteSqlFile("src/database/functions/towers/join.sql")
	utils.ExecuteSqlFile("src/database/functions/towers/get.sql")
	utils.ExecuteSqlFile("src/database/functions/towers/create.sql")

	return types.CreateController("towers", (*app).GetService("towers")).
		AddEndpoint(types.CreateEndpoint("create", "towers", "create", createTower)).
		AddEndpoint(types.CreateEndpoint("update", "towers", "update", updateTower)).
		AddEndpoint(types.CreateEndpoint("delete", "towers", "delete", deleteTower)).
		AddEndpoint(types.CreateEndpoint("get", "towers", "get", getTower)).
		AddEndpoint(types.CreateEndpoint("join", "towers", "join", joinTower))
}
