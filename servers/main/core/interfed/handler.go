package interfed

import (
	"fmt"
	"sigma/main/core/types"
	"sigma/main/core/utils"
	"strings"

	"github.com/valyala/fasthttp"
)

var allowedRoutes = map[string]bool{
	"towers/join": true,
}

func HandleInterfedPacket(app *types.App, channelId string, payload types.InterfedPacket) {
	fmt.Println("federation message from:", channelId, "payload:", payload)
	data := types.Decrypt("server_key", payload.Data)
	if data != "" {
		if allowedRoutes[payload.Key] {
			parts := strings.Split(payload.Key, "/")
			packet := types.CreateWebPacketForSocket("/" + payload.Key, []byte(data), "", func(answer []byte) {
				app.Memory.IFResChannel <- [2][]byte{[]byte(channelId), answer}
			})
			if len(parts) == 2 {
				service := app.GetService(parts[0])
				if service != nil {
					var method = service.GetMethod(parts[1])
					if method != nil && method.MethodOptions.AsEndpoint {
						var temp = method.InTemplate
						if data, success, err := utils.ValidateWebPacket([]byte(payload.Data), nil, temp, utils.BODY); success {
							if method.Check.User {
								var userId, userType, token = types.Authenticate(app, packet)
								if userId > 0 {
									if method.Check.Tower {
										var location = types.HandleLocation(app, token, userId, userType, packet)
										if location.TowerId > 0 {
											types.HandleResult(app, method.Callback, packet, data, types.CreateAssistant(userId, userType, location.TowerId, location.RoomId, location.WorkerId, packet))
										} else {
											packet.AnswerWithJson(fasthttp.StatusNotFound, map[string]string{}, utils.BuildErrorJson("access denied"))
										}
									} else {
										types.HandleResult(app, method.Callback, packet, data, types.CreateAssistant(userId, userType, 0, 0, 0, packet))
									}
								}
							} else {
								types.HandleResult(app, method.Callback, packet, data, types.CreateAssistant(0, "", 0, 0, 0, packet))
							}
						} else {
							packet.AnswerWithJson(fasthttp.StatusNotFound, map[string]string{}, utils.BuildErrorJson(err.Error()))
						}
					}
				} else {
					packet.AnswerWithJson(fasthttp.StatusNotFound, map[string]string{}, utils.BuildErrorJson("endpoint not found"))
				}
			} else {
				packet.AnswerWithJson(fasthttp.StatusNotFound, map[string]string{}, utils.BuildErrorJson("controller not found"))
			}
		}
	}
}
