package network

import (
	"context"
	"fmt"
	"sigma/core/src/core/apps"
	"sigma/core/src/interfaces"
	"sigma/core/src/types"
	"sigma/core/src/utils"
	"strconv"
	"strings"

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

type Network struct {
	app *interfaces.IApp
}

func (n Network) authenticate(packet types.WebPacket) int64 {
	var query = `
		select user_id from session where token = $1 limit 1
	`
	var id int64 = 0
	if err := (*n.app).GetDatabase().GetDb().QueryRow(context.Background(), query, packet.GetHeader("token")).
		Scan(&id); err != nil {
		fmt.Println(err)
		packet.AnswerWithJson(fasthttp.StatusForbidden, map[string]string{}, utils.BuildErrorJson(err.Error()))
		return 0
	} else {
		return id
	}
}

type Location struct {
	TowerId int64
	RoomId  int64
}

func (n Network) authorizeHuman(humanId int64, packet types.WebPacket) Location {
	var query = `
		select id from member where human_id = $1 and tower_id = $2 limit 1
	`
	tid, err1 := strconv.ParseInt(string(packet.GetHeader("tower_id")), 10, 64)
	if err1 != nil {
		fmt.Println(err1)
		return Location{TowerId: 0, RoomId: 0}
	}
	var id int64 = 0
	if err2 := (*n.app).GetDatabase().GetDb().QueryRow(context.Background(), query, humanId, tid).
		Scan(&id); err2 != nil {
		fmt.Println(err2)
		packet.AnswerWithJson(fasthttp.StatusForbidden, map[string]string{}, utils.BuildErrorJson(err2.Error()))
		return Location{TowerId: 0, RoomId: 0}
	}
	var query2 = `
		select id from room where id = $1 and tower_id = $2 limit 1
	`
	rid, err3 := strconv.ParseInt(string(packet.GetHeader("room_id")), 10, 64)
	if err3 != nil {
		fmt.Println(err3)
	}
	if rid > 0 {
		if err4 := (*n.app).GetDatabase().GetDb().QueryRow(context.Background(), query2, rid, tid).
			Scan(&id); err4 != nil {
			fmt.Println(err4)
			packet.AnswerWithJson(fasthttp.StatusForbidden, map[string]string{}, utils.BuildErrorJson(err4.Error()))
			return Location{TowerId: 0, RoomId: 0}
		}
		if id == 0 {
			packet.AnswerWithJson(fasthttp.StatusForbidden, map[string]string{}, utils.BuildErrorJson("Room not found in tower"))
			return Location{TowerId: 0, RoomId: 0}
		}
	}
	return Location{TowerId: tid, RoomId: rid}
}

func (n Network) handleResult(
	callback func(app *interfaces.IApp, input interfaces.IDto, guard interfaces.IGuard) (any, error),
	packet types.WebPacket,
	temp interfaces.IDto,
	guard interfaces.IGuard,
) {
	result, err := callback(n.app, temp, guard)
	if err != nil {
		packet.AnswerWithJson(fasthttp.StatusInternalServerError, map[string]string{}, utils.BuildErrorJson(err.Error()))
	} else {
		packet.AnswerWithJson(fasthttp.StatusOK, map[string]string{}, result)
	}
}

func (n Network) handleWebsocket(ctx *fasthttp.RequestCtx) {
	err := upgrader.Upgrade(ctx, func(conn *websocket.Conn) {
		for {
			messageType, p, err := conn.ReadMessage()
			if err != nil {
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
								if err := conn.WriteMessage(messageType, answer); err != nil {
									fmt.Println(err)
									return
								}
							},
						).(types.WebPacket)
						if utils.ValidateWebPacket(packet, &temp, utils.BODY) {
							if method.GetCheck().NeedUser() {
								var userId = n.authenticate(packet)
								if userId > 0 {
									if method.GetCheck().NeedTower() {
										var location = n.authorizeHuman(userId, packet)
										if location.TowerId > 0 {
											n.handleResult(method.GetCallback(), packet, temp, types.CreateGuard(userId, location.TowerId, location.RoomId))
										} else {
											packet.AnswerWithJson(fasthttp.StatusNotFound, map[string]string{}, utils.BuildErrorJson("access denied"))
										}
									} else {
										n.handleResult(method.GetCallback(), packet, temp, types.CreateGuard(userId, 0, 0))
									}
								}
							} else {
								n.handleResult(method.GetCallback(), packet, temp, types.CreateGuard(0, 0, 0))
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

func (n Network) fastHTTPHandler(ctx *fasthttp.RequestCtx) {
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
						if utils.ValidateWebPacket(packet, &temp, utils.BODY) {
							if method.GetCheck().NeedUser() {
								var userId = n.authenticate(packet)
								if userId > 0 {
									if method.GetCheck().NeedTower() {
										var location = n.authorizeHuman(userId, packet)
										if location.TowerId > 0 {
											n.handleResult(method.GetCallback(), packet, temp, types.CreateGuard(userId, location.TowerId, location.RoomId))
										} else {
											packet.AnswerWithJson(fasthttp.StatusNotFound, map[string]string{}, utils.BuildErrorJson("access denied"))
										}
									} else {
										n.handleResult(method.GetCallback(), packet, temp, types.CreateGuard(userId, 0, 0))
									}
								}
							} else {
								n.handleResult(method.GetCallback(), packet, temp, types.CreateGuard(0, 0, 0))
							}
						}
					} else if ctx.IsGet() {
						if utils.ValidateWebPacket(packet, &temp, utils.QUERY) {
							if method.GetCheck().NeedUser() {
								var userId = n.authenticate(packet)
								if userId > 0 {
									if method.GetCheck().NeedTower() {
										var location = n.authorizeHuman(userId, packet)
										if location.TowerId > 0 {
											n.handleResult(method.GetCallback(), packet, temp, types.CreateGuard(userId, location.TowerId, location.RoomId))
										} else {
											packet.AnswerWithJson(fasthttp.StatusNotFound, map[string]string{}, utils.BuildErrorJson("access denied"))
										}
									} else {
										n.handleResult(method.GetCallback(), packet, temp, types.CreateGuard(userId, 0, 0))
									}
								}
							} else {
								n.handleResult(method.GetCallback(), packet, temp, types.CreateGuard(0, 0, 0))
							}
						}
					}
				} else {
					packet.AnswerWithJson(fasthttp.StatusNotFound, map[string]string{}, utils.BuildErrorJson("endpoint not found"))
				}
			} else {
				packet.AnswerWithJson(fasthttp.StatusNotFound, map[string]string{}, utils.BuildErrorJson("controller not found"))
			}
		} else {
			packet.AnswerWithJson(fasthttp.StatusBadRequest, map[string]string{}, utils.BuildErrorJson("service path is not specific"))
		}
	}
}

func (n Network) Listen(restPort int, socketPort int) {
	fmt.Println(fmt.Sprintf("Listening to rest port %d ...", restPort))
	go fasthttp.ListenAndServe(fmt.Sprintf("0.0.0.0:%d", restPort), n.fastHTTPHandler)
}

func CreateNetwork() Network {
	fmt.Println("running network...")
	var netInstance = Network{}
	netInstance.app = apps.GetApp()
	return netInstance
}
