package controllers

import (
	"sigma/core/src/interfaces"
	"sigma/core/src/types"
	"sigma/core/src/utils"

	"github.com/valyala/fasthttp"
)

func createRoom(app *interfaces.IApp, p interfaces.IPacket, dto interfaces.IDto, guard interfaces.IGuard) {
	wp := p.(types.WebPacket)
	result, err := (*app).GetService("rooms").CallMethod(app, "create", dto, guard)
	if (err != nil) {
		wp.AnswerWithJson(fasthttp.StatusInternalServerError, map[string]string{}, utils.BuildErrorJson(err.Error()))
	} else {
		wp.AnswerWithJson(fasthttp.StatusOK, map[string]string{}, result)
	}
}

func updateRoom(app *interfaces.IApp, p interfaces.IPacket, dto interfaces.IDto, guard interfaces.IGuard) {
	wp := p.(types.WebPacket)
	result, err := (*app).GetService("rooms").CallMethod(app, "update", dto, guard)
	if (err != nil) {
		wp.AnswerWithJson(fasthttp.StatusInternalServerError, map[string]string{}, utils.BuildErrorJson(err.Error()))
	} else {
		wp.AnswerWithJson(fasthttp.StatusOK, map[string]string{}, result)
	}
}

func deleteRoom(app *interfaces.IApp, p interfaces.IPacket, dto interfaces.IDto, guard interfaces.IGuard) {
	wp := p.(types.WebPacket)
	result, err := (*app).GetService("rooms").CallMethod(app, "delete", dto, guard)
	if (err != nil) {
		wp.AnswerWithJson(fasthttp.StatusInternalServerError, map[string]string{}, utils.BuildErrorJson(err.Error()))
	} else {
		wp.AnswerWithJson(fasthttp.StatusOK, map[string]string{}, result)
	}
}

func getRoom(app *interfaces.IApp, p interfaces.IPacket, dto interfaces.IDto, guard interfaces.IGuard) {
	wp := p.(types.WebPacket)
	result, err := (*app).GetService("rooms").CallMethod(app, "get", dto, guard)
	if (err != nil) {
		wp.AnswerWithJson(fasthttp.StatusInternalServerError, map[string]string{}, utils.BuildErrorJson(err.Error()))
	} else {
		wp.AnswerWithJson(fasthttp.StatusOK, map[string]string{}, result)
	}
}

func CreateRoomController(app *interfaces.IApp) interfaces.IController {

	// Tables
	utils.ExecuteSqlFile("src/database/tables/room.sql")

	// Functions
	utils.ExecuteSqlFile("src/database/functions/rooms/get.sql")

	return types.CreateController("rooms", (*app).GetService("rooms")).
		AddEndpoint(types.CreateEndpoint("create", "rooms", "create", createRoom)).
		AddEndpoint(types.CreateEndpoint("update", "rooms", "update", updateRoom)).
		AddEndpoint(types.CreateEndpoint("delete", "rooms", "delete", deleteRoom)).
		AddEndpoint(types.CreateEndpoint("get", "rooms", "get", getRoom))
}
