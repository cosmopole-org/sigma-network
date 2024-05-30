package pusher

import (
	"encoding/json"
	"sigma/main/core/models"
	"sigma/main/core/utils"
	"strings"

	cmap "github.com/orcaman/concurrent-map/v2"
)

type Pusher struct {
	appId         string
	Clients       map[string]func([]byte)
	Groups        *cmap.ConcurrentMap[string, *cmap.ConcurrentMap[string, models.Client]]
	ToOuterOrigin func(string, models.OriginPacket)
}

func (p *Pusher) PushToUser(key string, userId string, data any, requestId string, alreadySerialized bool) {
	userOrigin := strings.Split(userId, "_")[1]
	if userOrigin == p.appId {
		conn := p.Clients[userId]
		if conn != nil {
			if len(requestId) > 0 {
				conn([]byte("response " + requestId + " " + data.(string)))
			} else {
				if alreadySerialized {
					conn([]byte("update " + key + " " + data.(string)))
				} else {
					message, err := json.Marshal(data)
					if err != nil {
						utils.Log(5, err)
					} else {
						conn([]byte("update " + key + " " + string(message)))
					}
				}
			}
		}
	} else {
		if alreadySerialized {
			p.ToOuterOrigin(userOrigin, models.OriginPacket{IsResponse: false, Key: "update " + key, UserId: userId, Data: data.(string)})
		} else {
			message, err := json.Marshal(data)
			if err != nil {
				utils.Log(5, err)
			} else {
				p.ToOuterOrigin(userOrigin, models.OriginPacket{IsResponse: false, Key: "update " + key, UserId: userId, Data: string(message)})
			}
		}
	}
}

func (p *Pusher) PushToGroup(key string, groupId string, data any, exceptions []models.Client) {
	var excepDict = map[string]bool{}
	for _, exc := range exceptions {
		excepDict[exc.UserId] = true
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
				utils.Log(5, err)
				return
			}
			message = msg
		}
		var packet = []byte("update " + key + " " + string(message))
		var foreignersMap = map[string][]models.Client{}
		for t := range group.IterBuffered() {
			userId := t.Val.UserId
			userOrigin := strings.Split(userId, "_")[1]
			if userOrigin == p.appId {
				if !excepDict[t.Key] {
					var conn = p.Clients[userId]
					if conn != nil {
						conn(packet)
					}
				}
			} else {
				if foreignersMap[userOrigin] == nil {
					foreignersMap[userOrigin] = []models.Client{}
				}
				if excepDict[t.Key] {
					foreignersMap[userOrigin] = append(foreignersMap[userOrigin], t.Val)
				}
			}
		}
		for k, v := range foreignersMap {
			p.ToOuterOrigin(k, models.OriginPacket{IsResponse: false, Key: "groupUpdate " + key, SpaceId: groupId, Exceptions: v, Data: string(message)})
		}
	}
}

func (p *Pusher) JoinGroup(groupId string, userId string) {
	g, ok := p.RetriveGroup(groupId)
	if ok {
		g.Set(userId, models.Client{UserId: userId})
	}
}

func (p *Pusher) LeaveGroup(groupId string, userId string) {
	g, ok := p.RetriveGroup(groupId)
	if ok {
		g.Remove(userId)
	}
}

func (p *Pusher) RetriveGroup(groupId string) (*cmap.ConcurrentMap[string, models.Client], bool) {
	ok := p.Groups.Has(groupId)
	if !ok {
		newMap := cmap.New[models.Client]()
		p.Groups.SetIfAbsent(groupId, &newMap)
	}
	return p.Groups.Get(groupId)
}

func CreatePusher(appId string, toOuterOrigin func(string, models.OriginPacket)) *Pusher {
	utils.Log(5, "running network...")
	utils.LoadValidationSystem()
	newMap := cmap.New[*cmap.ConcurrentMap[string, models.Client]]()
	return &Pusher{
		appId:         appId,
		Clients:       map[string]func([]byte){},
		Groups:        &newMap,
		ToOuterOrigin: toOuterOrigin,
	}
}
