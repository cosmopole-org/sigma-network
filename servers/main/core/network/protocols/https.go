package sigma_network_protocols

import (
	"fmt"
	"sigma/main/core/interfaces"
	sigma_network_handlers "sigma/main/core/network/handlers"
	sigma_network_security "sigma/main/core/network/security"
	"sigma/main/core/types"
	"sigma/main/core/utils"
	"strings"

	"github.com/valyala/fasthttp"
)

type EmptySuccessResponse struct {
	Success bool `json:"success"`
}

func HttpHandler(app interfaces.IApp, ctx *fasthttp.RequestCtx) {
	if string(ctx.Request.Header.Peek("Upgrade")) == "websocket" {
		HandleWebsocket(app, ctx)
	} else {
		var uri = strings.Split(string(ctx.RequestURI()[:]), "?")[0]
		parts := strings.Split(uri, "/")
		var packet = types.CreateWebPacket(ctx).(types.WebPacket)
		if len(parts) == 3 {
			service := app.GetService(parts[1])
			if service != nil {
				var method = service.GetMethod(parts[2])
				if method != nil && method.MethodOptions().AsEndpoint() {
					var temp = method.GetInTemplate()
					if ctx.IsOptions() {
						packet.AnswerWithJson(fasthttp.StatusOK, map[string]string{}, EmptySuccessResponse{Success: true})
					} else if ctx.IsPost() || ctx.IsPut() || ctx.IsDelete() {
						form, err := ctx.MultipartForm()
						var d = temp
						if err == nil {
							sigma_network_handlers.HandleRawMethod(app, method.(types.Method), packet, form)
						} else if data, success := utils.ValidateWebPacket(packet, d, utils.BODY); success {
							if method.GetCheck().NeedUser() {
								var userId, userType, token = sigma_network_security.Authenticate(app, packet)
								if userId > 0 {
									if method.GetCheck().NeedTower() {
										var location = sigma_network_security.HandleLocation(app, token, userId, userType, packet)
										if location.TowerId > 0 {
											sigma_network_handlers.HandleResult(app, method.GetCallback(), packet, data, types.CreateAssistant(userId, userType, location.TowerId, location.RoomId, location.WorkerId, packet))
										} else {
											packet.AnswerWithJson(fasthttp.StatusNotFound, map[string]string{}, utils.BuildErrorJson("access denied"))
										}
									} else {
										sigma_network_handlers.HandleResult(app, method.GetCallback(), packet, data, types.CreateAssistant(userId, userType, 0, 0, 0, packet))
									}
								}
							} else {
								sigma_network_handlers.HandleResult(app, method.GetCallback(), packet, data, types.CreateAssistant(0, "", 0, 0, 0, packet))
							}
						}
					} else if ctx.IsGet() {
						var d = temp
						if data, success := utils.ValidateWebPacket(packet, d, utils.QUERY); success {
							if method.GetCheck().NeedUser() {
								var userId, userType, token = sigma_network_security.Authenticate(app, packet)
								if userId > 0 {
									if method.GetCheck().NeedTower() {
										var location = sigma_network_security.HandleLocation(app, token, userId, userType, packet)
										if location.TowerId > 0 {
											sigma_network_handlers.HandleResult(app, method.GetCallback(), packet, data, types.CreateAssistant(userId, userType, location.TowerId, location.RoomId, location.WorkerId, packet))
										} else {
											packet.AnswerWithJson(fasthttp.StatusNotFound, map[string]string{}, utils.BuildErrorJson("access denied"))
										}
									} else {
										sigma_network_handlers.HandleResult(app, method.GetCallback(), packet, data, types.CreateAssistant(userId, userType, 0, 0, 0, packet))
									}
								}
							} else {
								sigma_network_handlers.HandleResult(app, method.GetCallback(), packet, data, types.CreateAssistant(0, "", 0, 0, 0, packet))
							}
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

func ListenForHttps(app interfaces.IApp, port int) {
	fmt.Println("Listening to rest port ", port, "...")
	s := &fasthttp.Server{
		ReduceMemoryUsage: true,
		Handler: func(ctx *fasthttp.RequestCtx) {
			HttpHandler(app, ctx)
		},
	}
	go s.ListenAndServe(fmt.Sprintf("0.0.0.0:%d", port))
}
