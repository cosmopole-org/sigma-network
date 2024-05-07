package modules

import (
	"encoding/json"
	"fmt"
	"sigma/main/core/utils"

	"github.com/gofiber/contrib/websocket"

	"github.com/orcaman/concurrent-map/v2"
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
	Groups  *cmap.ConcurrentMap[string, *cmap.ConcurrentMap[string, GroupMember]]
}

func (p *Pusher) PushToUser(key string, userId int64, userOrigin string, data any, isFedMsg bool, alreadySerialized bool) {
	if userOrigin == app.AppId {
		conn := p.Clients[userId]
		if conn != nil {
			if isFedMsg {
				conn.WriteMessage(websocket.TextMessage, []byte("federation "+key+" "+data.(string)))
			} else {
				if alreadySerialized {
					conn.WriteMessage(websocket.TextMessage, []byte("update "+key+" "+data.(string)))
				} else {
					message, err := json.Marshal(data)
					if err != nil {
						fmt.Println(err)
					} else {
						conn.WriteMessage(websocket.TextMessage, []byte("update "+key+" "+string(message)))
					}
				}
			}
		}
	} else {
		if alreadySerialized {
			app.Memory.SendInFederation(userOrigin, InterfedPacket{IsResponse: false, Key: "update " + key, UserId: userId, Data: data.(string)})
		} else {
			message, err := json.Marshal(data)
			if err != nil {
				fmt.Println(err)
			} else {
				app.Memory.SendInFederation(userOrigin, InterfedPacket{IsResponse: false, Key: "update " + key, UserId: userId, Data: string(message)})
			}
		}
	}
}

func (p *Pusher) PushToGroup(key string, groupId int64, data any, exceptions []int64) {
	var excepDict = map[int64]bool{}
	for _, exc := range exceptions {
		excepDict[exc] = true
	}
	group, ok := p.RetriveGroup(groupId)
	if ok {
		var message []byte
		switch d := data.(type) {
		case string:
			message = []byte(d)
		default:
			msg, err := json.Marshal(d)
			if err != nil {
				fmt.Println(err)
				return
			}
			message = msg
		}
		var packet = []byte("update " + string(message))
		var foreignersMap = map[string]bool{}
		fmt.Println(group.Items())
		for t := range group.IterBuffered() {
			userId := t.Val.UserId
			if !excepDict[userId] {
				if t.Val.UserOrigin == app.AppId {
					var conn = p.Clients[userId]
					if conn != nil {
						conn.WriteMessage(websocket.TextMessage, packet)
					}
				} else {
					if !foreignersMap[t.Val.UserOrigin] {
						foreignersMap[t.Val.UserOrigin] = true
					}
				}
			}
		}
		for k, _ := range foreignersMap {
			app.Memory.SendInFederation(k, InterfedPacket{IsResponse: false, Key: "groupUpdate " + key, GroupId: groupId, Data: string(message)})
		}
	}
}

type GroupMember struct {
	UserId     int64
	UserOrigin string
}

func (p *Pusher) JoinGroup(groupId int64, userId int64, userOrigin string) {
	g, ok := p.RetriveGroup(groupId)
	if ok {
		g.Set(fmt.Sprintf("%d", userId), GroupMember{UserId: userId, UserOrigin: userOrigin})
	}
}

func (p *Pusher) LeaveGroup(groupId int64, userId int64) {
	g, ok := p.RetriveGroup(groupId)
	if ok {
		g.Remove(fmt.Sprintf("%d", userId))
	}
}

func (p *Pusher) RetriveGroup(groupId int64) (*cmap.ConcurrentMap[string, GroupMember], bool) {
	a, b := p.Groups.Get(fmt.Sprintf("%d", groupId))
	fmt.Println(a, groupId, b)
	ok := p.Groups.Has(fmt.Sprintf("%d", groupId))
	if !ok {
		newMap := cmap.New[GroupMember]()
		p.Groups.SetIfAbsent(fmt.Sprintf("%d", groupId), &newMap)
	}
	return p.Groups.Get(fmt.Sprintf("%d", groupId))
}

func LoadPusher() *Pusher {
	newMap := cmap.New[*cmap.ConcurrentMap[string, GroupMember]]()
	return &Pusher{
		Clients: map[int64]*websocket.Conn{},
		Groups:  &newMap,
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
