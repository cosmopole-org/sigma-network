package shell_websocket

import (
	"encoding/json"
	"errors"
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

var instance *WsServer

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

func AddEndpoint[T modules.IDto, V any](m *modules.Method[T, V]) {
	instance.Endpoints[m.Key] = func(rawBody string, token string, origin string, requestId string) (any, string, error) {
		body := new(T)
		err := json.Unmarshal([]byte(rawBody), body)
		if err != nil {
			return nil, "error", errors.New("invalid input format")
		}
		errs := modules.ValidateInput[T](*body)
		if len(errs) > 0 {
			resErr, err := json.Marshal(errs)
			if err != nil {
				return nil, "error", err
			}
			return nil, "error", errors.New(string(resErr))
		}
		var f = *body
		statusCode, res := modules.ProcessData[T, V](origin, token, f, requestId, m, nil)
		if statusCode != fiber.StatusOK {
			return nil, "error", errors.New(res.(utils.Error).Message)
		}
		if (m.MethodOptions.Fed) && (origin != modules.Instance().AppId) {
			return res, "noaction", nil
		}
		return res, "response", nil
	}
}

func Load(app *modules.App, httpServer *shell_http.HttpServer) {
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
				endpoint, ok := instance.Endpoints[uri]
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
	instance = &WsServer{Endpoints: make(map[string]func(string, string, string, string) (any, string, error))}
	Load(app, httpServer)
	return instance
}