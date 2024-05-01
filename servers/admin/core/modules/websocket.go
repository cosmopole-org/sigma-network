package modules

import (
	"encoding/json"
	"fmt"
	"sigma/admin/core/utils"
	"strings"
	"sync"

	"github.com/fasthttp/websocket"
	"github.com/valyala/fasthttp"
)

var upgrader = websocket.FastHTTPUpgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *fasthttp.RequestCtx) bool {
		return true
	},
}

var clients = map[int64]*websocket.Conn{}

func HandleWebsocket(app *App, ctx *fasthttp.RequestCtx) {
	err := upgrader.Upgrade(ctx, func(conn *websocket.Conn) {
		for {
			_, p, err := conn.ReadMessage()
			if err != nil {
				conn.CloseHandler()(1, "connection closed")
				fmt.Println(err)
				return
			}
			var dataStr = string(p[:])
			var splittedMsg = strings.Split(dataStr, " ")
			var uri = splittedMsg[0]
			var requestId = splittedMsg[1]
			var body = dataStr[(len(uri) + 1 + len(requestId)):]
			parts := strings.Split(uri, "/")
			if len(parts) == 3 {
				service := app.GetService(parts[1])
				if service != nil {
					var method = service.GetMethod(parts[2])
					if method != nil && method.MethodOptions.AsEndpoint {
						var temp = method.InTemplate
						var packet = CreateWebPacketForSocket(
							uri,
							[]byte(body),
							requestId,
							func(answer []byte) {
								if err := conn.WriteMessage(websocket.TextMessage, answer); err != nil {
									fmt.Println(err)
									return
								}
							},
						).(WebPacket)
						var d = temp
						if data, success, err := utils.ValidateWebPacket(packet.Body, nil, d, utils.BODY); success {
							if method.Check.User {
								var userId, userType, token = Authenticate(app, &packet)
								if userId > 0 {
									if method.Check.Tower {
										var location = HandleLocation(app, token, userId, userType, &packet)
										if location.TowerId > 0 {
											HandleResult(app, method.Callback, packet, data, CreateAssistant(userId, userType, location.TowerId, location.RoomId, location.WorkerId, packet))
										} else {
											packet.AnswerWithJson(fasthttp.StatusNotFound, map[string]string{}, utils.BuildErrorJson("access denied"))
										}
									} else {
										HandleResult(app, method.Callback, packet, data, CreateAssistant(userId, userType, 0, 0, 0, packet))
									}
								}
							} else {
								HandleResult(app, method.Callback, packet, data, CreateAssistant(0, "", 0, 0, 0, packet))
							}
						} else {
							packet.AnswerWithJson(fasthttp.StatusBadRequest, map[string]string{}, utils.BuildErrorJson(err.Error()))
						}
					}
				} else {
					fmt.Println("authenticating socket...")
					if parts[1] == "auth" && parts[2] == "login" {
						var authHolder = AuthHolder{}
						var err = json.Unmarshal([]byte(body), &authHolder)
						if err != nil {
							fmt.Println(err)
						} else {
							var userId, _ = AuthWithToken(app, authHolder.Token)
							if userId > 0 {
								clients[userId] = conn
								conn.SetCloseHandler(func(code int, text string) error {
									fmt.Println("client disconnected")
									delete(clients, userId)
									return nil
								})
								var packet = CreateWebPacketForSocket(
									uri,
									[]byte(body),
									requestId,
									func(answer []byte) {
										if err := conn.WriteMessage(websocket.TextMessage, answer); err != nil {
											fmt.Println(err)
											return
										}
									},
								).(WebPacket)
								packet.AnswerWithJson(fasthttp.StatusOK, map[string]string{}, `{ "success": true }`)
							}
						}
					}
				}
			}
		}
	})
	if err != nil {
		fmt.Println(err)
		return
	}
}

var groups = sync.Map{}

type Pusher struct {
}

func (p *Pusher) PushToUser(userId int64, data any) {
	conn := clients[userId]
	if conn != nil {
		message, err := json.Marshal(data)
		if err != nil {
			fmt.Println(err)
		} else {
			var p = "update " + string(message)
			conn.WriteMessage(websocket.TextMessage, []byte(p))
		}
	}
}

func (p *Pusher) PushToGroup(groupId int64, data any, exceptions []int64) {
	var excepDict = map[int64]bool{}
	for _, exc := range exceptions {
		excepDict[exc] = true
	}
	g, _ := groups.LoadOrStore(groupId, &sync.Map{})
	group := g.(*sync.Map)
	message, err := json.Marshal(data)
	if err != nil {
		fmt.Println(err)
	} else {
		var packet = []byte("update " + string(message))
		group.Range(func(key, value any) bool {
			var userId = key.(int64)
			if !excepDict[userId] {
				var conn = clients[userId]
				if conn != nil {
					conn.WriteMessage(websocket.TextMessage, packet)
				}
			}
			return true
		})
	}
}

func (p *Pusher) JoinGroup(groupId int64, userId int64) {
	g, _ := groups.LoadOrStore(groupId, &sync.Map{})
	group := g.(*sync.Map)
	group.Store(userId, true)
}

func (p *Pusher) LeaveGroup(groupId int64, userId int64) {
	g, _ := groups.LoadOrStore(groupId, &sync.Map{})
	group := g.(*sync.Map)
	group.Delete(userId)
}

func LoadPusher() *Pusher {
	return &Pusher{}
}
