package modules

import (
	"encoding/json"
	"fmt"
	"sigma/admin/core/utils"
	"sync"

	"github.com/gofiber/contrib/websocket"
)

type Network struct {
	HttpServer   *HttpServer
	PusherServer *Pusher
}

func CreateListenOptions(https bool, httpsPort int, grpc bool, grpcPort int) ListenOptions {
	return ListenOptions{https, httpsPort, grpc, grpcPort}
}

func (n *Network) Listen(port int) {
	n.HttpServer.ListenForHttps(Instance(), port)
}

type Pusher struct {
	Clients map[int64]*websocket.Conn
	Groups  sync.Map
}

func (p *Pusher) PushToUser(userId int64, data any, isFedMsg bool) {
	conn := p.Clients[userId]
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
	g, _ := p.Groups.LoadOrStore(groupId, &sync.Map{})
	group := g.(*sync.Map)
	message, err := json.Marshal(data)
	if err != nil {
		fmt.Println(err)
	} else {
		var packet = []byte("update " + string(message))
		group.Range(func(key, value any) bool {
			var userId = key.(int64)
			if !excepDict[userId] {
				var conn = p.Clients[userId]
				if conn != nil {
					conn.WriteMessage(websocket.TextMessage, packet)
				}
			}
			return true
		})
	}
}

func (p *Pusher) JoinGroup(groupId int64, userId int64) {
	g, _ := p.Groups.LoadOrStore(groupId, &sync.Map{})
	group := g.(*sync.Map)
	group.Store(userId, true)
}

func (p *Pusher) LeaveGroup(groupId int64, userId int64) {
	g, _ := p.Groups.LoadOrStore(groupId, &sync.Map{})
	group := g.(*sync.Map)
	group.Delete(userId)
}

func LoadPusher() *Pusher {
	return &Pusher{
		Clients: map[int64]*websocket.Conn{},
		Groups:  sync.Map{},
	}
}

func CreateNetwork() *Network {
	fmt.Println("running network...")
	netInstance := &Network{}
	utils.LoadValidationSystem()
	LoadHttpServer()
	netInstance.HttpServer = LoadHttpServer()
	netInstance.PusherServer = LoadPusher()
	return netInstance
}
