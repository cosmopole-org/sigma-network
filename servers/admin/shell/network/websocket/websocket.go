package shell_websocket

import (
	"encoding/json"
	"sigma/admin/core/modules"
	"sigma/admin/core/utils"
	shell_http "sigma/admin/shell/network/http"
	"strings"

	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
)

type WebsocketAnswer struct {
	Status    int
	RequestId string
	Data      any
}

type WsServer struct {
	sigmaCore *modules.App
	Endpoints map[string]func(string, string, string, string) (any, string, error)
}

func AnswerSocket(conn *websocket.Conn, t string, requestId string, answer any) {
	answerBytes, err0 := json.Marshal(answer)
	if err0 != nil {
		utils.Log(logrus.DebugLevel, err0)
		return
	}
	if err := conn.WriteMessage(websocket.TextMessage, []byte(t+" "+requestId+" "+string(answerBytes))); err != nil {
		utils.Log(logrus.DebugLevel, err)
		return
	}
}

func (ws *WsServer) EnableEndpoint(key string) {
	ws.Endpoints[key] = func(rawBody string, token string, origin string, requestId string) (any, string, error) {
		statusCode, res, err := ws.sigmaCore.Services.CallAction(key, rawBody, token, origin)
		if statusCode == fiber.StatusOK {
			return res, "response", nil
		} else if statusCode == -2 {
			return res, "noaction", nil
		} else if err != nil {
			return nil, "error", err
		}
		return nil, "", nil
	}
}

func (ws *WsServer) Load(httpServer *shell_http.HttpServer) {
	httpServer.Server.Get("/ws", websocket.New(func(conn *websocket.Conn) {
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
				userId, _ := modules.AuthWithToken(ws.sigmaCore, token)
				uid = userId
				ws.sigmaCore.Pusher.Clients[userId] = func(b []byte) {
					conn.WriteMessage(websocket.TextMessage, b)
				}
				AnswerSocket(conn, "response", requestId, modules.ResponseSimpleMessage{Message: "authenticated"})
			} else {
				var token = splittedMsg[1]
				var origin = splittedMsg[2]
				var requestId = splittedMsg[3]
				var body = dataStr[(len(uri) + 1 + len(token) + 1 + len(origin) + 1 + len(requestId)):]
				endpoint, ok := ws.Endpoints[uri]
				if ok {
					res, resType, err := endpoint(body, token, origin, requestId)
					if err != nil {
						AnswerSocket(conn, resType, requestId, utils.BuildErrorJson(err.Error()))
					} else {
						AnswerSocket(conn, resType, requestId, res)
					}
				} else {
					AnswerSocket(conn, "error", requestId, utils.BuildErrorJson("endpoint not found"))
				}
			}
		}
		if uid > 0 {
			delete(ws.sigmaCore.Pusher.Clients, uid)
		}
		utils.Log(logrus.DebugLevel, "socket broken")
	}))
}

func New(sc *modules.App, httpServer *shell_http.HttpServer) *WsServer {
	ws := &WsServer{sigmaCore: sc, Endpoints: make(map[string]func(string, string, string, string) (any, string, error))}
	ws.Load(httpServer)
	return ws
}
