package network

import (
	"encoding/json"
	"fmt"
	"sigma/core/src/core/apps"
	"sigma/core/src/interfaces"
	"sigma/core/src/outputs"
	"sigma/core/src/types"
	"sigma/core/src/utils"
	"strconv"
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

var groups = sync.Map{}

type Network struct {
	app     *interfaces.IApp
	clients map[int64]*websocket.Conn
}

func (n *Network) authWithToken(token string) (int64, int32) {
	var auth = (*n.app).GetMemory().Get("auth::" + token)
	var userId int64 = 0
	var userType int32 = 0
	if auth != "" {
		var dataParts = strings.Split(auth, "/")
		i, err := strconv.ParseInt(dataParts[1], 10, 64)
		if err != nil {
			fmt.Println(err)
		} else {
			userId = i
		}
		if dataParts[0] == "human" {
			userType = 1
		} else if dataParts[0] == "machine" {
			userType = 2
		}
	}
	return userId, userType
}

func (n *Network) authenticate(packet types.WebPacket) (int64, string) {
	var id, creatureType = n.authWithToken(string(packet.GetHeader("token")))
	if id == 0 {
		packet.AnswerWithJson(fasthttp.StatusForbidden, map[string]string{}, utils.BuildErrorJson("token authentication failed"))
		return 0, ""
	} else {
		if creatureType == 1 {
			return id, "human"
		} else if creatureType == 2 {
			return id, "machine"
		}
		return 0, ""
	}
}

type Location struct {
	TowerId  int64
	RoomId   int64
	WorkerId int64
}

func (n *Network) authorizeHuman(humanId int64, packet types.WebPacket) Location {
	var towerId = string(packet.GetHeader("tower_id"))
	tid, err1 := strconv.ParseInt(towerId, 10, 64)
	if err1 != nil {
		fmt.Println(err1)
		return Location{TowerId: 0, RoomId: 0}
	}
	rid, err1 := strconv.ParseInt(string(packet.GetHeader("room_id")), 10, 64)
	if err1 != nil {
		fmt.Println(err1)
	}
	var memberData = (*n.app).GetMemory().Get(fmt.Sprintf("member::%d::%d", tid, humanId))
	var cityData = (*n.app).GetMemory().Get(fmt.Sprintf("city::%d", rid))
	if memberData != "" {
		if cityData != "" && cityData == towerId {
			return Location{TowerId: tid, RoomId: rid}
		} else {
			return Location{TowerId: tid, RoomId: 0}
		}
	} else {
		return Location{TowerId: 0, RoomId: 0}
	}
}

func (n *Network) authorizeMachine(machineId int64, packet types.WebPacket) Location {
	wid, err1 := strconv.ParseInt(string(packet.GetHeader("worker_id")), 10, 64)
	if err1 != nil {
		fmt.Println(err1)
		return Location{TowerId: 0, RoomId: 0}
	}
	var workerData = (*n.app).GetMemory().Get(fmt.Sprintf("worker::%d", wid))
	if workerData != "" {
		var dataParts = strings.Split(workerData, "/")
		var rid = dataParts[0]
		roomId, err2 := strconv.ParseInt(rid, 10, 64)
		if err2 != nil {
			fmt.Println(err2)
			return Location{TowerId: 0, RoomId: 0}
		}
		var mid = dataParts[1]
		machId, err3 := strconv.ParseInt(mid, 10, 64)
		if err3 != nil {
			fmt.Println(err3)
			return Location{TowerId: 0, RoomId: 0}
		}
		if machId != machineId {
			return Location{TowerId: 0, RoomId: 0}
		}
		var cityData = (*n.app).GetMemory().Get(fmt.Sprintf("city::%s", rid))
		if cityData == "" {
			return Location{TowerId: 0, RoomId: 0}
		}
		towerId, err4 := strconv.ParseInt(cityData, 10, 64)
		if err4 != nil {
			fmt.Println(err4)
			return Location{TowerId: 0, RoomId: 0}
		}
		return Location{TowerId: towerId, RoomId: roomId, WorkerId: wid}
	} else {
		return Location{TowerId: 0, RoomId: 0}
	}
}

func (n *Network) handleResult(
	callback func(app *interfaces.IApp, input interfaces.IDto, assistant interfaces.IAssistant) (any, error),
	packet types.WebPacket,
	temp interfaces.IDto,
	assistant interfaces.IAssistant,
) {
	result, err := callback(n.app, temp, assistant)
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

func (n *Network) handleLocation(userId int64, userType string, packet types.WebPacket) Location {
	var location Location
	if userType == "human" {
		location = n.authorizeHuman(userId, packet)
	} else {
		location = n.authorizeMachine(userId, packet)
	}
	return location
}

type AuthHolder struct {
	Token string `json:"token"`
}

func (n *Network) handleWebsocket(ctx *fasthttp.RequestCtx) {
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
				service := (*n.app).GetService(parts[1])
				if service != nil {
					var method = service.GetMethod(parts[2])
					if method != nil && method.AsEndpoint() {
						var temp = method.GetInTemplate()
						var packet = types.CreateWebPacketForSocket(
							uri,
							[]byte(body),
							requestId,
							func(answer []byte) {
								if err := conn.WriteMessage(websocket.TextMessage, answer); err != nil {
									fmt.Println(err)
									return
								}
							},
						).(types.WebPacket)
						if utils.ValidateWebPacket(packet, &temp, utils.BODY) {
							if method.GetCheck().NeedUser() {
								var userId, userType = n.authenticate(packet)
								if userId > 0 {
									if method.GetCheck().NeedTower() {
										var location = n.handleLocation(userId, userType, packet)
										if location.TowerId > 0 {
											n.handleResult(method.GetCallback(), packet, temp, types.CreateAssistant(userId, userType, location.TowerId, location.RoomId, location.WorkerId, packet))
										} else {
											packet.AnswerWithJson(fasthttp.StatusNotFound, map[string]string{}, utils.BuildErrorJson("access denied"))
										}
									} else {
										n.handleResult(method.GetCallback(), packet, temp, types.CreateAssistant(userId, userType, 0, 0, 0, packet))
									}
								}
							} else {
								n.handleResult(method.GetCallback(), packet, temp, types.CreateAssistant(0, "", 0, 0, 0, packet))
							}
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
							var userId, _ = n.authWithToken(authHolder.Token)
							if userId > 0 {
								n.clients[userId] = conn
								conn.SetCloseHandler(func(code int, text string) error {
									fmt.Println("client disconnected")
									delete(n.clients, userId)
									return nil
								})
								var packet = types.CreateWebPacketForSocket(
									uri,
									[]byte(body),
									requestId,
									func(answer []byte) {
										if err := conn.WriteMessage(websocket.TextMessage, answer); err != nil {
											fmt.Println(err)
											return
										}
									},
								).(types.WebPacket)
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

func (n *Network) handleRawResult(method *types.Method, assistant *types.Assistant, packet types.WebPacket) {
	result, err := method.GetCallback()(n.app, nil, assistant)
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

func (n *Network) handleRawMethod(method types.Method, packet types.WebPacket) {
	if method.GetCheck().NeedUser() {
		var userId, userType = n.authenticate(packet)
		if userId > 0 {
			if method.GetCheck().NeedTower() {
				var location = n.handleLocation(userId, userType, packet)
				if location.TowerId > 0 {
					n.handleRawResult(&method, types.CreateAssistant(userId, userType, location.TowerId, location.RoomId, location.WorkerId, packet), packet)
				} else {
					packet.AnswerWithJson(fasthttp.StatusNotFound, map[string]string{}, utils.BuildErrorJson("access denied"))
				}
			} else {
				n.handleRawResult(&method, types.CreateAssistant(userId, userType, 0, 0, 0, packet), packet)
			}
		}
	} else {
		n.handleRawResult(&method, types.CreateAssistant(0, "", 0, 0, 0, packet), packet)
	}
}

func (n *Network) fastHTTPHandler(ctx *fasthttp.RequestCtx) {
	if string(ctx.Request.Header.Peek("Upgrade")) == "websocket" {
		n.handleWebsocket(ctx)
	} else {
		var uri = strings.Split(string(ctx.RequestURI()[:]), "?")[0]
		parts := strings.Split(uri, "/")
		var packet = types.CreateWebPacket(ctx).(types.WebPacket)
		if len(parts) == 3 {
			service := (*n.app).GetService(parts[1])
			if service != nil {
				var method = service.GetMethod(parts[2])
				if method != nil && method.AsEndpoint() {
					var temp = method.GetInTemplate()
					if ctx.IsPost() || ctx.IsPut() || ctx.IsDelete() {
						if method.AsRaw() {
							n.handleRawMethod(method.(types.Method), packet)
						} else if utils.ValidateWebPacket(packet, &temp, utils.BODY) {
							if method.GetCheck().NeedUser() {
								var userId, userType = n.authenticate(packet)
								if userId > 0 {
									if method.GetCheck().NeedTower() {
										var location = n.handleLocation(userId, userType, packet)
										if location.TowerId > 0 {
											n.handleResult(method.GetCallback(), packet, temp, types.CreateAssistant(userId, userType, location.TowerId, location.RoomId, location.WorkerId, packet))
										} else {
											packet.AnswerWithJson(fasthttp.StatusNotFound, map[string]string{}, utils.BuildErrorJson("access denied"))
										}
									} else {
										n.handleResult(method.GetCallback(), packet, temp, types.CreateAssistant(userId, userType, 0, 0, 0, packet))
									}
								}
							} else {
								n.handleResult(method.GetCallback(), packet, temp, types.CreateAssistant(0, "", 0, 0, 0, packet))
							}
						}
					} else if ctx.IsGet() {
						if method.AsRaw() {
							n.handleRawMethod(method.(types.Method), packet)
						} else if utils.ValidateWebPacket(packet, &temp, utils.QUERY) {
							if method.GetCheck().NeedUser() {
								var userId, userType = n.authenticate(packet)
								if userId > 0 {
									if method.GetCheck().NeedTower() {
										var location = n.handleLocation(userId, userType, packet)
										if location.TowerId > 0 {
											n.handleResult(method.GetCallback(), packet, temp, types.CreateAssistant(userId, userType, location.TowerId, location.RoomId, location.WorkerId, packet))
										} else {
											packet.AnswerWithJson(fasthttp.StatusNotFound, map[string]string{}, utils.BuildErrorJson("access denied"))
										}
									} else {
										n.handleResult(method.GetCallback(), packet, temp, types.CreateAssistant(userId, userType, 0, 0, 0, packet))
									}
								}
							} else {
								n.handleResult(method.GetCallback(), packet, temp, types.CreateAssistant(0, "", 0, 0, 0, packet))
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

func (n *Network) Listen(restPort int, socketPort int) {
	fmt.Println(fmt.Sprintf("Listening to rest port %d ...", restPort))
	go fasthttp.ListenAndServe(fmt.Sprintf("0.0.0.0:%d", restPort), n.fastHTTPHandler)
}

func (n *Network) PushToUser(userId int64, data any) {
	conn := n.clients[userId]
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

func (n *Network) PushToGroup(groupId int64, data any, exceptions []int64) {
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
				var conn = n.clients[userId]
				if conn != nil {
					conn.WriteMessage(websocket.TextMessage, packet)
				}
			}
			return true
		})
	}
}

func (n *Network) JoinGroup(groupId int64, userId int64) {
	g, _ := groups.LoadOrStore(groupId, &sync.Map{})
	group := g.(*sync.Map)
	group.Store(userId, true)
}

func (n *Network) LeaveGroup(groupId int64, userId int64) {
	g, _ := groups.LoadOrStore(groupId, &sync.Map{})
	group := g.(*sync.Map)
	group.Delete(userId)
}

func CreateNetwork() *Network {
	fmt.Println("running network...")
	var netInstance = Network{}
	netInstance.app = apps.GetApp()
	netInstance.clients = map[int64]*websocket.Conn{}
	return &netInstance
}
