package net_ws

import (
	"encoding/json"
	"errors"
	"log"
	"sigma/sigma/abstract"
	"sigma/sigma/layer1/adapters"
	module_model "sigma/sigma/layer1/model"
	moduleactormodel "sigma/sigma/layer1/module/actor"
	"sigma/sigma/layer1/tools/security"
	"sigma/sigma/layer1/tools/signaler"
	net_http "sigma/sigma/layer3/tools/network/http"
	"sigma/sigverse/model"
	"strconv"
	"strings"

	"github.com/gofiber/contrib/websocket"
)

type WebsocketAnswer struct {
	Status    int
	RequestId string
	Data      any
}

type WsServer struct {
	Tokens map[string]string
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

func ParseInput[T abstract.IInput](i string) (abstract.IInput, error) {
	body := new(T)
	err := json.Unmarshal([]byte(i), body)
	if err != nil {
		return nil, errors.New("invalid input format")
	}
	return *body, nil
}

func (ws *WsServer) PrepareAnswer(answer any) []byte {
	answerBytes, err0 := json.Marshal(answer)
	if err0 != nil {
		log.Println(err0)
		return nil
	}
	return answerBytes
}

func (ws *WsServer) Load(core abstract.ICore, httpServer *net_http.HttpServer, security *security.Security, signaler *signaler.Signaler, storage adapters.IStorage) {
	httpServer.Server.Get("/ws", websocket.New(func(conn *websocket.Conn) {
		var uid string = ""
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
				userId, _, _ := security.AuthWithToken(token)
				if userId != "" {
					uid = userId
					signaler.ListenToSingle(&module_model.Listener{
						Id: userId,
						Signal: func(b any) {
							err := conn.WriteMessage(websocket.TextMessage, b.([]byte))
							if err != nil {
								return
							}
						},
					})
					var members []model.Member
					storage.Where("user_id = ?", userId).Find(&members)
					for _, member := range members {
						signaler.JoinGroup(member.SpaceId, uid)
					}
					AnswerSocket(conn, "response", requestId, module_model.ResponseSimpleMessage{Message: "authenticated"})
				} else {
					AnswerSocket(conn, "error", requestId, module_model.ResponseSimpleMessage{Message: "authentication failed"})
				}
			} else {
				var origin = splittedMsg[1]
				var requestId = splittedMsg[2]
				var layerNumStr = splittedMsg[3]
				layerNum, err := strconv.Atoi(layerNumStr)
				if err != nil {
					log.Println(err)
					layerNum = 1
					return
				}
				var body = dataStr[(len(uri) + 1 + len(origin) + 1 + len(requestId) + 1 + len(layerNumStr)):]	
				layer := core.Get(layerNum)
				action := layer.Actor().FetchAction(uri)
				if action == nil {
					AnswerSocket(conn, "error", requestId, module_model.ResponseSimpleMessage{Message: "action not found"})
					return
				}
				input, err := action.(*moduleactormodel.SecureAction).ParseInput("ws", body)
				if err != nil {
					log.Println(err)
					AnswerSocket(conn, "error", requestId, module_model.ResponseSimpleMessage{Message: "parsing input failed"})
					return
				}
				res, _, err2 := action.(*moduleactormodel.SecureAction).SecurelyAct(layer, ws.Tokens[uid], origin, requestId, input, "")
				if err2 != nil {
					AnswerSocket(conn, "error", requestId, module_model.BuildErrorJson(err2.Error()))
				} else {
					AnswerSocket(conn, "response", requestId, ws.PrepareAnswer(res))
				}
			}
		}
		if uid != "" {
			delete(signaler.Listeners, uid)
		}
		log.Println("socket broken")
	}))
}

func New(core abstract.ICore, httpServer *net_http.HttpServer, security *security.Security, signaler *signaler.Signaler, storage adapters.IStorage) *WsServer {
	ws := &WsServer{Tokens: make(map[string]string)}
	ws.Load(core, httpServer, security, signaler, storage)
	return ws
}
