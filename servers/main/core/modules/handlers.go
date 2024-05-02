package modules

import (
	"encoding/json"
	"fmt"
	"mime/multipart"
	"reflect"
	"sigma/main/core/outputs"
	"sigma/main/core/utils"

	"github.com/mitchellh/mapstructure"
	"github.com/valyala/fasthttp"
)

func HandleResult(
	app *App,
	key string,
	method *Method,
	packet *WebPacket,
	temp any,
	assistant Assistant,
) {
	tempValue := reflect.ValueOf(temp)
	originField := tempValue.FieldByName("Origin")
	if originField.Kind() != 0 && len(originField.String()) > 0 && originField.String() != app.AppId {
		if method.MethodOptions.InFederation {
			data, err := json.Marshal(temp)
			if err != nil {
				fmt.Println(err)
				return
			}
			reqId, err2 := utils.SecureUniqueString(16)
			if err2 != nil {
				fmt.Println(err2)
				return
			}
			app.Memory.RequestInFederation(originField.String(), InterfedPacket{Key: method.Key, UserId: assistant.UserId, TowerId: assistant.TowerId, RoomId: assistant.RoomId, Data: string(data), RequestId: reqId})
		}
	} else {
		result, err := method.Callback(app, temp, assistant)
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
}

func HandleRawResult(app *App, method *Method, assistant Assistant, packet *WebPacket, formData map[string]any) {
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

func HandleRawMethod(app *App, method *Method, packet *WebPacket, form *multipart.Form) {
	var formData = map[string]any{}
	for k, v := range form.Value {
		formData[k] = v
	}
	for k, v := range form.File {
		formData[k] = v
	}
	if method.Check.User {
		var userId, userType, token = Authenticate(app, packet)
		if userId > 0 {
			if method.Check.Tower {
				var location = HandleLocation(app, token, userId, userType, packet)
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
