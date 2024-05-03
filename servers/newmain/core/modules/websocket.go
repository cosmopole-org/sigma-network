package modules

import (
	"encoding/json"
	"fmt"
	"sigma/main/core/utils"
	"strings"

	//"sigma/main/core/utils"
	//"strings"
	"sync"

	"github.com/fasthttp/websocket"
	"github.com/mitchellh/mapstructure"
	"github.com/valyala/fasthttp"
)

type WebsocketAnswer struct {
	Status    int
	RequestId string
	Data      any
}

var upgrader = websocket.FastHTTPUpgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *fasthttp.RequestCtx) bool {
		return true
	},
}

var clients = map[int64]*websocket.Conn{}

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
			Instance().Memory.RequestInFederation(origin, InterfedPacket{Key: action, UserId: assistant.UserId, TowerId: assistant.TowerId, RoomId: assistant.RoomId, Data: string(data), RequestId: reqId})
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

func HandleWebsocket(app *App, ctx *fasthttp.RequestCtx) {
	err := upgrader.Upgrade(ctx, func(conn *websocket.Conn) {
		go func() {
			for {
				_, p, err := conn.ReadMessage()
				if err != nil {
					conn.CloseHandler()(1, "connection closed")
					fmt.Println(err)
					continue
				}
				var dataStr = string(p[:])
				var splittedMsg = strings.Split(dataStr, " ")
				var uri = splittedMsg[0]
				var token = splittedMsg[1]
				var towerId = splittedMsg[2]
				var roomId = splittedMsg[3]
				var origin = splittedMsg[4]
				var requestId = splittedMsg[5]
				var body = dataStr[(len(uri) + 1 + len(token) + 1 + len(towerId) + 1 + len(roomId) + 1 + len(origin) + 1 + len(requestId)):]
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
				if mo.AsEndpoint {
					if c.User {
						var userId, userType = AuthWithToken(app, token)
						if userId > 0 {
							if c.Tower {
								var towerId = ""
								var roomId = ""
								var location Location
								if userType == 1 {
									location = HandleLocationWithProcessed(app, token, userId, "human", towerId, roomId, 0)
								} else if userType == 2 {
									location = HandleLocationWithProcessed(app, token, 0, "machine", towerId, roomId, userId)
								}
								if location.TowerId > 0 {
									res, err := HandleFederationOrNotForSocket(uri, origin, c, mo, fn, f, CreateAssistant(userId, "human", 0, 0, 0, nil))
									if err != nil {
										AnswerSocket(conn, requestId, utils.BuildErrorJson(err.Error()))
									} else {
										AnswerSocket(conn, requestId, res)
									}
								} else {
									AnswerSocket(conn, requestId, utils.BuildErrorJson("access denied"))
								}
							} else {
								res, err := HandleFederationOrNotForSocket(uri, origin, c, mo, fn, f, CreateAssistant(userId, "human", 0, 0, 0, nil))
								if err != nil {
									AnswerSocket(conn, requestId, utils.BuildErrorJson(err.Error()))
								} else {
									AnswerSocket(conn, requestId, res)
								}
							}
						}
					} else {
						AnswerSocket(conn, requestId, utils.BuildErrorJson("authentication failed"))
					}
				} else {
					res, err := HandleFederationOrNotForSocket(uri, origin, c, mo, fn, f, CreateAssistant(0, "", 0, 0, 0, nil))
					if err != nil {
						AnswerSocket(conn, requestId, utils.BuildErrorJson(err.Error()))
					} else {
						AnswerSocket(conn, requestId, res)
					}
				}
			}
		}()
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
