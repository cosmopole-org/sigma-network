package shell_websocket

import (
	"encoding/json"
	"fmt"
	"sigma/main/core/modules"
	"sigma/main/core/utils"
	"strings"

	"github.com/gofiber/contrib/websocket"
	"github.com/mitchellh/mapstructure"
)

type WebsocketAnswer struct {
	Status    int
	RequestId string
	Data      any
}

func AnswerSocket(conn *websocket.Conn, requestId string, answer any) {
	answerBytes, err0 := json.Marshal(answer)
	if err0 != nil {
		fmt.Println(err0)
		return
	}
	if err := conn.WriteMessage(websocket.TextMessage, []byte(requestId+" "+string(answerBytes))); err != nil {
		fmt.Println(err)
		return
	}
}

func HandleNonFederationReq(action string, origin string, c modules.Check, mo modules.MethodOptions, fn func(*modules.App, interface{}, modules.Assistant) (any, error), f interface{}, assistant modules.Assistant) (any, error) {
	result, err := fn(modules.Instance(), f, assistant)
	if err != nil {
		return nil, err
	}
	return result, nil
}

func LoadWebsocket(app *modules.App) {
	app.Network.HttpServer.Server.Get("/ws", websocket.New(func(conn *websocket.Conn) {
		var uid int64 = 0
		for {
			_, p, err := conn.ReadMessage()
			if err != nil {
				break
			}
			var dataStr = string(p[:])
			var splittedMsg = strings.Split(dataStr, " ")
			var uri = splittedMsg[0]
			if uri == "authenticate" {
				var token = splittedMsg[1]
				var requestId = splittedMsg[2]
				userId, _ := modules.AuthWithToken(app, token)
				uid = userId
				app.Network.PusherServer.Clients[userId] = conn
				AnswerSocket(conn, requestId, modules.ResponseSimpleMessage{Message: "authenticated"})
			} else {
				var token = splittedMsg[1]
				var origin = splittedMsg[2]
				var requestId = splittedMsg[3]
				var body = dataStr[(len(uri) + 1 + len(token) + 1 + len(origin) + 1 + len(requestId)):]
				fn := modules.Handlers[uri]
				f := modules.Frames[uri]
				c := modules.Checks[uri]
				mo := modules.MethodOptionsMap[uri]
				var req any
				err2 := json.Unmarshal([]byte(body), &req)
				if err2 != nil {
					AnswerSocket(conn, requestId, utils.BuildErrorJson("invalid input format"))
					continue
				}
				err3 := mapstructure.Decode(req, &f)
				if err3 != nil {
					AnswerSocket(conn, requestId, utils.BuildErrorJson("bad request"))
					continue
				}
				towerId := f.(modules.IDto).GetTowerId()
				roomId := f.(modules.IDto).GetRoomId()
				if mo.AsEndpoint {
					var doLocal = func() {
						if c.User {
							var userId, userType = modules.AuthWithToken(app, token)
							var creature = ""
							if userType == 1 {
								creature = "human"
							} else if userType == 2 {
								creature = "machine"
							}
							if userId > 0 {
								if c.Tower {
									var location modules.Location
									if userType == 1 {
										location = modules.HandleLocationWithProcessed(app, token, userId, "human", towerId, roomId, 0)
									} else if userType == 2 {
										location = modules.HandleLocationWithProcessed(app, token, 0, "machine", towerId, roomId, userId)
									}
									if location.TowerId > 0 {
										res, err := HandleNonFederationReq(uri, origin, c, mo, fn, f, modules.CreateAssistant(userId, creature, location.TowerId, location.RoomId, userId, nil))
										if err != nil {
											AnswerSocket(conn, requestId, utils.BuildErrorJson(err.Error()))
										} else {
											AnswerSocket(conn, requestId, res)
										}
									} else {
										AnswerSocket(conn, requestId, utils.BuildErrorJson("access denied"))
									}
								} else {
									res, err := HandleNonFederationReq(uri, origin, c, mo, fn, f, modules.CreateAssistant(userId, creature, 0, 0, 0, nil))
									if err != nil {
										AnswerSocket(conn, requestId, utils.BuildErrorJson(err.Error()))
									} else {
										AnswerSocket(conn, requestId, res)
									}
								}
							} else {
								AnswerSocket(conn, requestId, utils.BuildErrorJson("authentication failed"))
							}
						} else {
							res, err := HandleNonFederationReq(uri, origin, c, mo, fn, f, modules.CreateAssistant(0, "", 0, 0, 0, nil))
							if err != nil {
								AnswerSocket(conn, requestId, utils.BuildErrorJson(err.Error()))
							} else {
								AnswerSocket(conn, requestId, res)
							}
						}
					}
					if mo.InFederation {
						if origin == app.AppId {
							doLocal()
						} else {
							if c.User {
								var userId, _ = modules.AuthWithToken(app, token)
								if userId > 0 {
									modules.Instance().Memory.SendInFederation(origin, modules.InterfedPacket{IsResponse: false, Key: uri, UserId: userId, TowerId: towerId, RoomId: roomId, Data: body, RequestId: requestId})
									AnswerSocket(conn, requestId, modules.ResponseSimpleMessage{Message: "request to federation queued successfully"})
								} else {
									AnswerSocket(conn, requestId, utils.BuildErrorJson("authentication failed"))
								}
							} else {
								modules.Instance().Memory.SendInFederation(origin, modules.InterfedPacket{IsResponse: false, Key: uri, UserId: 0, TowerId: 0, RoomId: 0, Data: body, RequestId: requestId})
								AnswerSocket(conn, requestId, modules.ResponseSimpleMessage{Message: "request to federation queued successfully"})
							}
						}
					} else {
						doLocal()
					}
				} else {
					AnswerSocket(conn, requestId, utils.BuildErrorJson("access to service denied"))
				}
			}
		}
		if uid > 0 {
			delete(app.Network.PusherServer.Clients, uid)
		}
		fmt.Println("socket broken")
	}))
}
