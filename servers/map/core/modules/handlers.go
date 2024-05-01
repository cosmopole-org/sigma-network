package modules

import (
	"mime/multipart"
	"sigma/map/core/outputs"
	"sigma/map/core/utils"

	"github.com/mitchellh/mapstructure"
	"github.com/valyala/fasthttp"
)

func HandleResult(
	app *App,
	callback func(app *App, input interface{}, assistant Assistant) (any, error),
	packet WebPacket,
	temp interface{},
	assistant Assistant) {
	result, err := callback(app, temp, assistant)
	if err != nil {
		packet.AnswerWithJson(fasthttp.StatusInternalServerError, map[string]string{}, utils.BuildErrorJson(err.Error()))
	} else {
		switch v := result.(type) {
		default:
			packet.AnswerWithJson(fasthttp.StatusOK, map[string]string{}, result)
		case outputs.Command:
			if v.Value == "sendFile" {
				packet.AnswerWithFile(fasthttp.StatusOK, map[string]string{}, v.Data)
			}
		}
	}
}

func HandleRawResult(app *App, method *Method, assistant Assistant, packet WebPacket, formData map[string]any) {
	var d = method.InTemplate
	mapstructure.Decode(formData, &d)
	result, err := method.Callback(app, d, assistant)
	if err != nil {
		packet.AnswerWithJson(fasthttp.StatusInternalServerError, map[string]string{}, utils.BuildErrorJson(err.Error()))
	} else {
		switch v := result.(type) {
		default:
			packet.AnswerWithJson(fasthttp.StatusOK, map[string]string{}, result)
		case outputs.Command:
			if v.Value == "sendFile" {
				packet.AnswerWithFile(fasthttp.StatusOK, map[string]string{}, v.Data)
			}
		}
	}
}

func HandleRawMethod(app *App, method *Method, packet WebPacket, form *multipart.Form) {
	var formData = map[string]any{}
	for k, v := range form.Value {
		formData[k] = v
	}
	for k, v := range form.File {
		formData[k] = v
	}
	if method.Check.User {
		var userId, userType, token = Authenticate(app, &packet)
		if userId > 0 {
			if method.Check.Tower {
				var location = HandleLocation(app, token, userId, userType, &packet)
				if location.TowerId > 0 {
					HandleRawResult(app, method, CreateAssistant(userId, userType, location.TowerId, location.RoomId, location.WorkerId, packet), packet, formData)
				} else {
					packet.AnswerWithJson(fasthttp.StatusNotFound, map[string]string{}, utils.BuildErrorJson("access denied"))
				}
			} else {
				HandleRawResult(app, method, CreateAssistant(userId, userType, 0, 0, 0, packet), packet, formData)
			}
		}
	} else {
		HandleRawResult(app, method, CreateAssistant(0, "", 0, 0, 0, packet), packet, formData)
	}
}
