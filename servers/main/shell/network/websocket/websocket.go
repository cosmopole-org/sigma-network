package shell_websocket

import (
	"encoding/json"
	"log"
	"sigma/main/core/modules"
	"sigma/main/core/utils"
	shell_http "sigma/main/shell/network/http"
	"strings"

	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
)

type WebsocketAnswer struct {
	Status    int
	RequestId string
	Data      any
}

type WsServer struct {
	Endpoints map[string]func(string, string, string, string) (any, string, error)
}

func AnswerSocket(conn *websocket.Conn, t string, requestId string, answer any) {
	answerBytes, err0 := json.Marshal(answer)
	if err0 != nil {
		log.Println(err0)
		return
	}
	if err := conn.WriteMessage(websocket.TextMessage, []byte(t+" "+requestId+" "+string(answerBytes))); err != nil {
		log.Println(err)
		return
	}
}

func (ws *WsServer) EnableEndpoint(key string) {
	ws.Endpoints[key] = func(rawBody string, token string, origin string, requestId string) (any, string, error) {
		statusCode, res, err := modules.Instance().Services.CallAction(key, rawBody, token, origin)
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

func (ws *WsServer) Load(app *modules.App, httpServer *shell_http.HttpServer) {
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
				userId, _ := modules.AuthWithToken(app, token)
				uid = userId
				app.Network.PusherServer.Clients[userId] = conn
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
			delete(app.Network.PusherServer.Clients, uid)
		}
		log.Println("socket broken")
	}))
}

func New(app *modules.App, httpServer *shell_http.HttpServer) *WsServer {
	ws := &WsServer{Endpoints: make(map[string]func(string, string, string, string) (any, string, error))}
	ws.Load(app, httpServer)
	return ws
}
