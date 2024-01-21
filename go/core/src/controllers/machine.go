package controllers

import (
	"sigma/core/src/interfaces"
	"sigma/core/src/types"
	"sigma/core/src/utils"

	"github.com/valyala/fasthttp"
)

func createMachine(app *interfaces.IApp, p interfaces.IPacket, dto interfaces.IDto, guard interfaces.IGuard) {
	wp := p.(types.WebPacket)
	result, err := (*app).GetService("machines").CallMethod(app, "create", dto, guard)
	if (err != nil) {
		wp.AnswerWithJson(fasthttp.StatusInternalServerError, map[string]string{}, utils.BuildErrorJson(err.Error()))
	} else {
		wp.AnswerWithJson(fasthttp.StatusOK, map[string]string{}, result)
	}
}

func updateMachine(app *interfaces.IApp, p interfaces.IPacket, dto interfaces.IDto, guard interfaces.IGuard) {
	wp := p.(types.WebPacket)
	result, err := (*app).GetService("machines").CallMethod(app, "update", dto, guard)
	if (err != nil) {
		wp.AnswerWithJson(fasthttp.StatusInternalServerError, map[string]string{}, utils.BuildErrorJson(err.Error()))
	} else {
		wp.AnswerWithJson(fasthttp.StatusOK, map[string]string{}, result)
	}
}

func deleteMachine(app *interfaces.IApp, p interfaces.IPacket, dto interfaces.IDto, guard interfaces.IGuard) {
	wp := p.(types.WebPacket)
	result, err := (*app).GetService("machines").CallMethod(app, "delete", dto, guard)
	if (err != nil) {
		wp.AnswerWithJson(fasthttp.StatusInternalServerError, map[string]string{}, utils.BuildErrorJson(err.Error()))
	} else {
		wp.AnswerWithJson(fasthttp.StatusOK, map[string]string{}, result)
	}
}

func getMachine(app *interfaces.IApp, p interfaces.IPacket, dto interfaces.IDto, guard interfaces.IGuard) {
	wp := p.(types.WebPacket)
	result, err := (*app).GetService("machines").CallMethod(app, "get", dto, guard)
	if (err != nil) {
		wp.AnswerWithJson(fasthttp.StatusInternalServerError, map[string]string{}, utils.BuildErrorJson(err.Error()))
	} else {
		wp.AnswerWithJson(fasthttp.StatusOK, map[string]string{}, result)
	}
}

func CreateMachineController(app *interfaces.IApp) interfaces.IController {
	return types.CreateController("machines", (*app).GetService("machines")).
		AddEndpoint(types.CreateEndpoint("create", "machines", "create", createMachine)).
		AddEndpoint(types.CreateEndpoint("update", "machines", "update", updateMachine)).
		AddEndpoint(types.CreateEndpoint("delete", "machines", "delete", deleteMachine)).
		AddEndpoint(types.CreateEndpoint("get", "machines", "get", getMachine))
}
