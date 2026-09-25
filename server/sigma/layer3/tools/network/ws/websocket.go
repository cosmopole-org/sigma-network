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
	"sigma/sigma/utils/crypto"
	"sigma/sigverse/model"
	"strconv"
	"strings"
	"sync"
	"time"

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

var queue = map[string]chan any{}

func (ws *WsServer) Load(core abstract.ICore, httpServer *net_http.HttpServer, security *security.Security, signaler *signaler.Signaler, storage adapters.IStorage) {
	httpServer.Server.Get("/ws", websocket.New(func(conn *websocket.Conn) {
		var uid string = ""
		qk := crypto.SecureUniqueString()
		// One socket, two writers: this request loop answers actions while the
		// signaler goroutine pushes updates. gorilla/fasthttp websockets do not
		// permit concurrent writes, so both go through this lock.
		var writeMu sync.Mutex
		answer := func(t string, requestId string, payload any) {
			writeMu.Lock()
			defer writeMu.Unlock()
			AnswerSocket(conn, t, requestId, payload)
		}
		for {
			_, p, err := conn.ReadMessage()
			if err != nil {
				break
			}
			var dataStr = string(p[:])
			log.Println(dataStr)
			var splittedMsg = strings.Split(dataStr, " ")
			var uri = splittedMsg[0]
			if len(splittedMsg) > 1 {
				if uri == "authenticate" {
					if len(splittedMsg) >= 3 {
						var token = splittedMsg[1]
						var requestId = splittedMsg[2]
						userId, _, _ := security.AuthWithToken(token)
						if userId != "" {
							uid = userId
							// remember the token so that actions sent over this
							// socket can be authorised
							signaler.Lock.Lock()
							ws.Tokens[uid] = token
							signaler.Lock.Unlock()
							queue[qk] = make(chan any)
							go func() {
								for {
									select {
									case b := <-queue[qk]:
										writeMu.Lock()
										err := conn.WriteMessage(websocket.TextMessage, b.([]byte))
										writeMu.Unlock()
										if err != nil {
											return
										}
									case <-time.After(5 * time.Second):
									}
									if queue[qk] == nil {
										break
									}
								}
							}()
							signaler.ListenToSingle(&module_model.Listener{
								Id: userId,
								Signal: func(b any) {
									queue[qk] <- b
								},
							})
							var members []model.Member
							storage.Where("user_id = ?", userId).Find(&members)
							for _, member := range members {
								signaler.JoinGroup(member.SpaceId, uid)
							}
							answer("response", requestId, module_model.ResponseSimpleMessage{Message: "authenticated"})
						} else {
							answer("error", requestId, module_model.ResponseSimpleMessage{Message: "authentication failed"})
						}
					}
				} else {
					if len(splittedMsg) >= 4 {
						var origin = splittedMsg[1]
						var requestId = splittedMsg[2]
						var layerNumStr = splittedMsg[3]
						layerNum, err := strconv.Atoi(layerNumStr)
						if err != nil {
							log.Println(err)
							layerNum = 1
							continue
						}
						var body = dataStr[(len(uri) + 1 + len(origin) + 1 + len(requestId) + 1 + len(layerNumStr)):]
						layer := core.Get(layerNum)
						action := layer.Actor().FetchAction(uri)
						if action == nil {
							answer("error", requestId, module_model.ResponseSimpleMessage{Message: "action not found"})
							continue
						}
						// Wasm-hosted actions register a single global parser
						// rather than one per transport, exactly as the HTTP
						// entry point already handles.
						protocol := "ws"
						if action.(*moduleactormodel.SecureAction).HasGlobalParser() {
							protocol = "*"
						}
						input, err := action.(*moduleactormodel.SecureAction).ParseInput(protocol, body)
						if err != nil {
							log.Println(err)
							answer("error", requestId, module_model.ResponseSimpleMessage{Message: "parsing input failed"})
							continue
						}
						_, res, err2 := action.(*moduleactormodel.SecureAction).SecurelyAct(layer, ws.Tokens[uid], origin, requestId, input, "")
						if err2 != nil {
							answer("error", requestId, module_model.BuildErrorJson(err2.Error()))
						} else {
							answer("response", requestId, res)
						}
					}
				}
			}
		}
		if uid != "" {
			signaler.Lock.Lock()
			delete(queue, qk)
			delete(signaler.Listeners, uid)
			signaler.Lock.Unlock()
		}
		log.Println("socket broken")
	}))
}

func New(core abstract.ICore, httpServer *net_http.HttpServer, security *security.Security, signaler *signaler.Signaler, storage adapters.IStorage) *WsServer {
	ws := &WsServer{Tokens: make(map[string]string)}
	ws.Load(core, httpServer, security, signaler, storage)
	return ws
}
