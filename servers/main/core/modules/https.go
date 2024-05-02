package modules

import (
	"fmt"
	"sigma/main/core/utils"
	"strings"

	"github.com/valyala/fasthttp"
)

type EmptySuccessResponse struct {
	Success bool `json:"success"`
}

func HttpHandler(app *App, ctx *fasthttp.RequestCtx) {
	if string(ctx.Request.Header.Peek("Upgrade")) == "websocket" {
		HandleWebsocket(app, ctx)
	} else {
		var uri = strings.Split(string(ctx.RequestURI()[:]), "?")[0]
		parts := strings.Split(uri, "/")
		packet := CreateWebPacket(ctx)
		if len(parts) == 3 {
			service := app.GetService(parts[1])
			if service != nil {
				var method = service.GetMethod(parts[2])
				if method != nil && method.MethodOptions.AsEndpoint {
					var temp = method.InTemplate
					if ctx.IsOptions() {
						packet.AnswerWithJson(fasthttp.StatusOK, map[string]string{}, EmptySuccessResponse{Success: true})
					} else if ctx.IsPost() || ctx.IsPut() || ctx.IsDelete() {
						form, err := ctx.MultipartForm()
						var d = temp
						if err == nil {
							HandleRawMethod(app, method, packet, form)
						} else if data, success, err := utils.ValidateWebPacket(packet.GetBody(), nil, d, utils.BODY); success {
							if method.Check.User {
								var userId, userType, token = Authenticate(app, packet)
								if userId > 0 {
									if method.Check.Tower {
										var location = HandleLocation(app, token, userId, userType, packet)
										if location.TowerId > 0 {
											HandleResult(app, parts[1] + "/" + parts[2], method, packet, data, CreateAssistant(userId, userType, location.TowerId, location.RoomId, location.WorkerId, packet))
										} else {
											packet.AnswerWithJson(fasthttp.StatusNotFound, map[string]string{}, utils.BuildErrorJson("access denied"))
										}
									} else {
										HandleResult(app, parts[1] + "/" + parts[2], method, packet, data, CreateAssistant(userId, userType, 0, 0, 0, packet))
									}
								}
							} else {
								HandleResult(app, parts[1] + "/" + parts[2], method, packet, data, CreateAssistant(0, "", 0, 0, 0, packet))
							}
						} else {
							packet.AnswerWithJson(fasthttp.StatusNotFound, map[string]string{}, utils.BuildErrorJson(err.Error()))
						}
					} else if ctx.IsGet() {
						var d = temp
						if data, success, err := utils.ValidateWebPacket(nil, packet.GetQuery(), d, utils.QUERY); success {
							if method.Check.User {
								var userId, userType, token = Authenticate(app, packet)
								if userId > 0 {
									if method.Check.Tower {
										var location = HandleLocation(app, token, userId, userType, packet)
										if location.TowerId > 0 {
											HandleResult(app, parts[1] + "/" + parts[2], method, packet, data, CreateAssistant(userId, userType, location.TowerId, location.RoomId, location.WorkerId, packet))
										} else {
											packet.AnswerWithJson(fasthttp.StatusNotFound, map[string]string{}, utils.BuildErrorJson("access denied"))
										}
									} else {
										HandleResult(app, parts[1] + "/" + parts[2], method, packet, data, CreateAssistant(userId, userType, 0, 0, 0, packet))
									}
								}
							} else {
								HandleResult(app, parts[1] + "/" + parts[2], method, packet, data, CreateAssistant(0, "", 0, 0, 0, packet))
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

func ListenForHttps(app *App, port int) {
	fmt.Println("Listening to rest port ", port, "...")
	s := &fasthttp.Server{
		ReduceMemoryUsage: true,
		Handler: func(ctx *fasthttp.RequestCtx) {
			HttpHandler(app, ctx)
		},
	}
	go s.ListenAndServe(fmt.Sprintf("0.0.0.0:%d", port))
}
