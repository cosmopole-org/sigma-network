package sigma_network_handlers

import (
	"mime/multipart"
	"sigma/main/core/interfaces"
	sigma_network_security "sigma/main/core/network/security"
	"sigma/main/core/outputs"
	"sigma/main/core/types"
	"sigma/main/core/utils"

	"github.com/mitchellh/mapstructure"
	"github.com/valyala/fasthttp"
)

func HandleResult(
	app interfaces.IApp,
	callback func(app interfaces.IApp, input interface{}, assistant interfaces.IAssistant) (any, error),
	packet types.WebPacket,
	temp interface{},
	assistant interfaces.IAssistant) {
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

func HandleRawResult(app interfaces.IApp, method *types.Method, assistant *types.Assistant, packet types.WebPacket, formData map[string]any) {
	var d = method.GetInTemplate()
	mapstructure.Decode(formData, &d)
	result, err := method.GetCallback()(app, d, assistant)
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

func HandleRawMethod(app interfaces.IApp, method types.Method, packet types.WebPacket, form *multipart.Form) {
	var formData = map[string]any{}
	for k, v := range form.Value {
		formData[k] = v
	}
	for k, v := range form.File {
		formData[k] = v
	}
	if method.GetCheck().NeedUser() {
		var userId, userType, token = sigma_network_security.Authenticate(app, packet)
		if userId > 0 {
			if method.GetCheck().NeedTower() {
				var location = sigma_network_security.HandleLocation(app, token, userId, userType, packet)
				if location.TowerId > 0 {
					HandleRawResult(app, &method, types.CreateAssistant(userId, userType, location.TowerId, location.RoomId, location.WorkerId, packet), packet, formData)
				} else {
					packet.AnswerWithJson(fasthttp.StatusNotFound, map[string]string{}, utils.BuildErrorJson("access denied"))
				}
			} else {
				HandleRawResult(app, &method, types.CreateAssistant(userId, userType, 0, 0, 0, packet), packet, formData)
			}
		}
	} else {
		HandleRawResult(app, &method, types.CreateAssistant(0, "", 0, 0, 0, packet), packet, formData)
	}
}
