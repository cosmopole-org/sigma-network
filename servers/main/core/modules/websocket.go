package modules

import (
	"encoding/json"
	"fmt"
	"sigma/main/core/utils"
	"strings"

	"sync"

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

func HandleFederationOrNotForSocket(action string, origin string, c Check, mo MethodOptions, fn func(*App, interface{}, Assistant) (any, error), f interface{}, assistant Assistant) (any, error) {
	if mo.InFederation {
		if origin == Instance().AppId {
			result, err := fn(Instance(), f, assistant)
			if err != nil {
				return nil, err
			}
			return result, nil
		} else {
			data, err := json.Marshal(f)
			if err != nil {
				fmt.Println(err)
				return nil, err
			}
			reqId, err2 := utils.SecureUniqueString(16)
			if err2 != nil {
				return nil, err
			}
			Instance().Memory.SendInFederation(origin, InterfedPacket{IsResponse: false, Key: action, UserId: assistant.UserId, TowerId: assistant.TowerId, RoomId: assistant.RoomId, Data: string(data), RequestId: reqId})
			return ResponseSimpleMessage{Message: "request to federation queued successfully"}, nil
		}
	} else {
		result, err := fn(Instance(), f, assistant)
		if err != nil {
			return nil, err
		}
		return result, nil
	}
}

func (pusher *Pusher) LoadWebsocket(app *App) {
	app.Network.RestServer.Server.Get("/ws", websocket.New(func(conn *websocket.Conn) {
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
				userId, _ := AuthWithToken(app, token)
				uid = userId
				pusher.clients[userId] = conn
				AnswerSocket(conn, requestId, ResponseSimpleMessage{Message: "authenticated"})
			} else {
				var token = splittedMsg[1]
				var origin = splittedMsg[2]
				var requestId = splittedMsg[3]
				var body = dataStr[(len(uri) + 1 + len(token) + 1 + len(origin) + 1 + len(requestId)):]
				fn := Handlers[uri]
				f := Frames[uri]
				c := Checks[uri]
				mo := MethodOptionsMap[uri]
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
				towerId := f.(IDto).GetTowerId()
				roomId := f.(IDto).GetRoomId()
				if mo.AsEndpoint {
					if c.User {
						var userId, userType = AuthWithToken(app, token)
						var creature = ""
						if userType == 1 {
							creature = "human"
						} else if userType == 2 {
							creature = "machine"
						}
						if userId > 0 {
							if c.Tower {
								var location Location
								if userType == 1 {
									location = HandleLocationWithProcessed(app, token, userId, "human", towerId, roomId, 0)
								} else if userType == 2 {
									location = HandleLocationWithProcessed(app, token, 0, "machine", towerId, roomId, userId)
								}
								if location.TowerId > 0 {
									res, err := HandleFederationOrNotForSocket(uri, origin, c, mo, fn, f, CreateAssistant(userId, creature, location.TowerId, location.RoomId, userId, nil))
									if err != nil {
										AnswerSocket(conn, requestId, utils.BuildErrorJson(err.Error()))
									} else {
										AnswerSocket(conn, requestId, res)
									}
								} else {
									AnswerSocket(conn, requestId, utils.BuildErrorJson("access denied"))
								}
							} else {
								res, err := HandleFederationOrNotForSocket(uri, origin, c, mo, fn, f, CreateAssistant(userId, creature, 0, 0, 0, nil))
								if err != nil {
									AnswerSocket(conn, requestId, utils.BuildErrorJson(err.Error()))
								} else {
									AnswerSocket(conn, requestId, res)
								}
							}
						}
					} else {
						res, err := HandleFederationOrNotForSocket(uri, origin, c, mo, fn, f, CreateAssistant(0, "", 0, 0, 0, nil))
						if err != nil {
							AnswerSocket(conn, requestId, utils.BuildErrorJson(err.Error()))
						} else {
							AnswerSocket(conn, requestId, res)
						}
					}
				} else {
					AnswerSocket(conn, requestId, utils.BuildErrorJson("access to service denied"))
				}
			}
		}
		if uid > 0 {
			delete(pusher.clients, uid)
		}
		fmt.Println("socket broken")
	}))
}

type Pusher struct {
	clients map[int64]*websocket.Conn
	groups  sync.Map
}

func (p *Pusher) PushToUser(userId int64, data any, isFedMsg bool) {
	conn := p.clients[userId]
	if conn != nil {
		if isFedMsg {
			conn.WriteMessage(websocket.TextMessage, []byte("federation "+data.(string)))
		} else {
			message, err := json.Marshal(data)
			if err != nil {
				fmt.Println(err)
			} else {
				conn.WriteMessage(websocket.TextMessage, []byte("update "+string(message)))
			}
		}
	}
}

func (p *Pusher) PushToGroup(groupId int64, data any, exceptions []int64) {
	var excepDict = map[int64]bool{}
	for _, exc := range exceptions {
		excepDict[exc] = true
	}
	g, _ := p.groups.LoadOrStore(groupId, &sync.Map{})
	group := g.(*sync.Map)
	message, err := json.Marshal(data)
	if err != nil {
		fmt.Println(err)
	} else {
		var packet = []byte("update " + string(message))
		group.Range(func(key, value any) bool {
			var userId = key.(int64)
			if !excepDict[userId] {
				var conn = p.clients[userId]
				if conn != nil {
					conn.WriteMessage(websocket.TextMessage, packet)
				}
			}
			return true
		})
	}
}

func (p *Pusher) JoinGroup(groupId int64, userId int64) {
	g, _ := p.groups.LoadOrStore(groupId, &sync.Map{})
	group := g.(*sync.Map)
	group.Store(userId, true)
}

func (p *Pusher) LeaveGroup(groupId int64, userId int64) {
	g, _ := p.groups.LoadOrStore(groupId, &sync.Map{})
	group := g.(*sync.Map)
	group.Delete(userId)
}

func LoadPusher() *Pusher {
	return &Pusher{
		clients: map[int64]*websocket.Conn{},
		groups:  sync.Map{},
	}
}
