package interfed

import (
	"fmt"
	"sigma/main/core/modules"
	// "sigma/main/core/utils"
	// "strings"

	// "github.com/valyala/fasthttp"
)

var allowedRoutes = map[string]bool{
	"towers/join": true,
}

func HandleInterfedPacket(app *modules.App, channelId string, payload modules.InterfedPacket) {
	fmt.Println("federation message from:", channelId, "payload:", payload)
	data := modules.Decrypt("server_key", payload.Data)
	if data != "" {
		if allowedRoutes[payload.Key] {
			// parts := strings.Split(payload.Key, "/")
			// packet := modules.CreateWebPacketForSocket("/"+payload.Key, []byte(data), "", func(answer []byte) {
			// 	app.Memory.IFResChannel <- [2][]byte{[]byte(channelId), answer}
			// })
			//if len(parts) == 2 {
			// 	service := app.GetService(parts[0])
			// 	if service != nil {
			// 		var method = service.GetMethod(parts[1])
			// 		if method != nil && method.MethodOptions.AsEndpoint {
			// 			// var temp = method.InTemplate
			// 			// if data, success, err := utils.ValidateWebPacket([]byte(payload.Data), nil, temp, utils.BODY); success {
			// 			// 	if method.Check.User {
			// 			// 		var userId, userType, token = modules.Authenticate(app, packet)
			// 			// 		if userId > 0 {
			// 			// 			if method.Check.Tower {
			// 			// 				var location = modules.HandleLocation(app, token, userId, userType, packet)
			// 			// 				if location.TowerId > 0 {
			// 			// 					modules.HandleResult(app, parts[0] + "/" + parts[1], method, packet, data, modules.CreateAssistant(userId, userType, location.TowerId, location.RoomId, location.WorkerId, packet))
			// 			// 				} else {
			// 			// 					packet.AnswerWithJson(fasthttp.StatusNotFound, map[string]string{}, utils.BuildErrorJson("access denied"))
			// 			// 				}
			// 			// 			} else {
			// 			// 				modules.HandleResult(app, parts[0] + "/" + parts[1], method, packet, data, modules.CreateAssistant(userId, userType, 0, 0, 0, packet))
			// 			// 			}
			// 			// 		}
			// 			// 	} else {
			// 			// 		modules.HandleResult(app, parts[0] + "/" + parts[1], method, packet, data, modules.CreateAssistant(0, "", 0, 0, 0, packet))
			// 			// 	}
			// 			// } else {
			// 			// 	packet.AnswerWithJson(fasthttp.StatusNotFound, map[string]string{}, utils.BuildErrorJson(err.Error()))
			// 			// }
			// 		}
			// 	} else {
			// 		packet.AnswerWithJson(fasthttp.StatusNotFound, map[string]string{}, utils.BuildErrorJson("endpoint not found"))
			// 	}
			// } else {
			// 	packet.AnswerWithJson(fasthttp.StatusNotFound, map[string]string{}, utils.BuildErrorJson("controller not found"))
			// }
		}
	}
}
