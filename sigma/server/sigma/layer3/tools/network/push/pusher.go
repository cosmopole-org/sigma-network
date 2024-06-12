package net_pusher

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"sigma/sigma/abstract"
	modulelogger "sigma/sigma/core/module/logger"
	"sigma/sigma/layer1/adapters"
	models "sigma/sigma/layer1/model"
	moduleactormodel "sigma/sigma/layer1/module/actor"
	"sigma/sigma/layer1/tools/signaler"
	"strconv"
	"strings"
	"time"

	"github.com/centrifugal/centrifuge"
)

type PusherServer struct {
	sigmaCore     abstract.ICore
	node          *centrifuge.Node
	mux           *http.ServeMux
	endpoints     map[string]bool
	userIdToToken map[string]string
	logger        *modulelogger.Logger
}

func handleLog(e centrifuge.LogEntry) {
	log.Printf("%s: %v", e.Message, e.Fields)
}

func (pt *PusherServer) Node() *centrifuge.Node {
	return pt.node
}

func (pt *PusherServer) Listen(port int) {
	go func() {
		err := http.ListenAndServe(fmt.Sprintf(":%d", port), pt.mux)
		if err != nil {
			pt.logger.Println(err)
		}
	}()
}

func ParseInput[T abstract.IInput](i string) (abstract.IInput, error) {
	body := new(T)
	err := json.Unmarshal([]byte(i), body)
	if err != nil {
		return nil, errors.New("invalid input format")
	}
	return *body, nil
}

func (pt *PusherServer) EnableEndpoint(key string) {
	pt.endpoints[key] = true
}

func (pt *PusherServer) PrepareAnswer(answer any) []byte {
	answerBytes, err0 := json.Marshal(answer)
	if err0 != nil {
		pt.logger.Println(err0)
		return nil
	}
	return answerBytes
}

func New(core abstract.ICore, logger *modulelogger.Logger, cache adapters.ICache, signaler *signaler.Signaler) *PusherServer {
	pusher := &PusherServer{
		sigmaCore:     core,
		endpoints:     make(map[string]bool),
		userIdToToken: make(map[string]string),
		logger:        logger,
	}
	logger.Println("creating pusher tool...")
	node, _ := centrifuge.New(centrifuge.Config{
		LogLevel:       centrifuge.LogLevelInfo,
		LogHandler:     handleLog,
		HistoryMetaTTL: 24 * time.Hour,
	})
	node.OnConnecting(func(ctx context.Context, e centrifuge.ConnectEvent) (centrifuge.ConnectReply, error) {
		userDataParts := strings.Split(cache.Get("plugin::"+e.Token), "/")
		if len(userDataParts) != 2 {
			return centrifuge.ConnectReply{}, centrifuge.DisconnectInvalidToken
		}
		userId := userDataParts[1]
		if userId == "" {
			return centrifuge.ConnectReply{}, centrifuge.DisconnectInvalidToken
		}
		newCtx := centrifuge.SetCredentials(ctx, &centrifuge.Credentials{
			UserID:   userId,
			ExpireAt: time.Now().Unix() + 60,
			Info:     []byte(`{}`),
		})
		return centrifuge.ConnectReply{
			Context: newCtx,
			Data:    []byte(`{}`),
			// Subscribe to a personal server-side channel.
			Subscriptions: map[string]centrifuge.SubscribeOptions{
				"#" + userId: {
					EnableRecovery: true,
					EmitPresence:   true,
					EmitJoinLeave:  true,
					PushJoinLeave:  true,
				},
			},
		}, nil
	})
	node.OnConnect(func(client *centrifuge.Client) {
		transport := client.Transport()
		log.Printf("[user %s] connected via %s with protocol: %s", client.UserID(), transport.Name(), transport.Protocol())

		signaler.ListenToSingle(&models.Listener{
			Id: client.UserID(),
			Signal: func(b any) {
				_, err := pusher.node.Publish("#"+client.UserID(), b.([]byte))
				if err != nil {
					return
				}
			},
		})

		// Event handler should not block, so start separate goroutine to
		// periodically send messages to client.
		go func() {
			for {
				select {
				case <-client.Context().Done():
					return
				case <-time.After(5 * time.Second):
					err := client.Send([]byte(`{"time": "` + strconv.FormatInt(time.Now().Unix(), 10) + `"}`))
					if err != nil {
						if err == io.EOF {
							return
						}
						log.Printf("error sending message: %s", err)
					}
				}
			}
		}()

		client.OnRefresh(func(e centrifuge.RefreshEvent, cb centrifuge.RefreshCallback) {
			log.Printf("[user %s] connection is going to expire, refreshing", client.UserID())
			userDataPrts := strings.Split(cache.Get("plugin::"+e.Token), "/")
			if len(userDataPrts) != 2 {
				cb(centrifuge.RefreshReply{}, centrifuge.DisconnectInvalidToken)
			}
			userId := userDataPrts[1]
			if userId == "" {
				cb(centrifuge.RefreshReply{}, centrifuge.DisconnectInvalidToken)
			}
			cb(centrifuge.RefreshReply{
				ExpireAt: time.Now().Unix() + 60,
			}, nil)
		})

		client.OnSubscribe(func(e centrifuge.SubscribeEvent, cb centrifuge.SubscribeCallback) {
			cb(centrifuge.SubscribeReply{}, centrifuge.ErrorPermissionDenied)
		})

		client.OnPublish(func(e centrifuge.PublishEvent, cb centrifuge.PublishCallback) {
			cb(centrifuge.PublishReply{}, centrifuge.ErrorPermissionDenied)
		})

		client.OnRPC(func(e centrifuge.RPCEvent, cb centrifuge.RPCCallback) {
			log.Printf("[user %s] sent RPC, data: %s, method: %s", client.UserID(), string(e.Data), e.Method)
			var raw = string(e.Data)
			var splittedMsg = strings.Split(raw, " ")
			var origin = splittedMsg[0]
			var packetId = splittedMsg[1]
			var layerNumStr = splittedMsg[2]
			layerNum, err := strconv.Atoi(layerNumStr)
			if err != nil {
				logger.Println(err)
				cb(centrifuge.RPCReply{}, centrifuge.ErrorBadRequest)
				return
			}
			var body = strings.TrimPrefix(raw[len(origin)+len(packetId)+1+len(layerNumStr)+1:], " ")
			layer := core.Get(layerNum)
			action := layer.Actor().FetchAction(e.Method)
			if action == nil {
				cb(centrifuge.RPCReply{}, centrifuge.ErrorMethodNotFound)
				return
			}
			input, err := action.(*moduleactormodel.SecureAction).ParseInput("pusher", body)
			if err != nil {
				pusher.logger.Println(err)
				cb(centrifuge.RPCReply{}, centrifuge.ErrorBadRequest)
				return
			}
			res, _, err2 := action.(*moduleactormodel.SecureAction).SecurelyAct(layer, pusher.userIdToToken[client.UserID()], origin, packetId, input)
			if err2 != nil {
				cb(centrifuge.RPCReply{Data: pusher.PrepareAnswer(models.BuildErrorJson(err2.Error()))}, nil)
			} else {
				cb(centrifuge.RPCReply{Data: pusher.PrepareAnswer(res)}, nil)
			}
		})

		client.OnPresence(func(e centrifuge.PresenceEvent, cb centrifuge.PresenceCallback) {
			log.Printf("[user %s] calls presence on %s", client.UserID(), e.Channel)

			if !client.IsSubscribed(e.Channel) {
				cb(centrifuge.PresenceReply{}, centrifuge.ErrorPermissionDenied)
				return
			}
			cb(centrifuge.PresenceReply{}, nil)
		})

		client.OnUnsubscribe(func(e centrifuge.UnsubscribeEvent) {
			log.Printf("[user %s] unsubscribed from %s: %s", client.UserID(), e.Channel, e.Reason)
		})

		client.OnAlive(func() {
			log.Printf("[user %s] connection is still active", client.UserID())
		})

		client.OnDisconnect(func(e centrifuge.DisconnectEvent) {
			log.Printf("[user %s] disconnected: %s", client.UserID(), e.Reason)
		})
	})
	if err := node.Run(); err != nil {
		log.Fatal(err)
	}

	signaler.BrdigeGlobally(&models.GlobalListener{
		Signal: func(groupId string, b any) {
			_, err := pusher.node.Publish(groupId, b.([]byte))
			if err != nil {
				return
			}
		},
	}, true)

	websocketHandler := centrifuge.NewWebsocketHandler(node, centrifuge.WebsocketConfig{
		ReadBufferSize:     1024,
		UseWriteBufferPool: true,
		CheckOrigin: func(r *http.Request) bool {
			originHeader := r.Header.Get("Origin")
			if originHeader == "" {
				return true
			}
			return true
		},
	})
	pusher.node = node
	mux := http.NewServeMux()
	mux.Handle("/connection/websocket", websocketHandler)
	mux.Handle("/connection/http_stream", CORS(centrifuge.NewHTTPStreamHandler(node, centrifuge.HTTPStreamConfig{})))
	pusher.mux = mux
	return pusher
}

func CORS(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		header := w.Header()
		header.Set("Access-Control-Allow-Origin", r.Header.Get("origin"))
		if allowHeaders := r.Header.Get("Access-Control-Request-Headers"); allowHeaders != "" && allowHeaders != "null" {
			header.Add("Access-Control-Allow-Headers", allowHeaders)
		}
		header.Set("Access-Control-Allow-Credentials", "true")
		h.ServeHTTP(w, r)
	})
}
