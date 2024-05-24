package pusher

import (
	"encoding/json"
	"fmt"
	"sigma/admin/core/models"
	"sigma/admin/core/utils"

	cmap "github.com/orcaman/concurrent-map/v2"
)

type Pusher struct {
	appId         string
	Clients       map[int64]func([]byte)
	Groups        *cmap.ConcurrentMap[string, *cmap.ConcurrentMap[string, models.GroupMember]]
	ToOuterOrigin func(string, models.OriginPacket)
}

func (p *Pusher) PushToUser(key string, userId int64, userOrigin string, data any, requestId string, alreadySerialized bool) {
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

func (p *Pusher) PushToGroup(key string, groupId int64, data any, exceptions []models.GroupMember) {
	var excepDict = map[string]bool{}
	for _, exc := range exceptions {
		excepDict[fmt.Sprintf("%d@%s", exc.UserId, exc.UserOrigin)] = true
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
		var foreignersMap = map[string][]models.GroupMember{}
		for t := range group.IterBuffered() {
			userId := t.Val.UserId
			if t.Val.UserOrigin == p.appId {
				if !excepDict[t.Key] {
					var conn = p.Clients[userId]
					if conn != nil {
						conn(packet)
					}
				}
			} else {
				if foreignersMap[t.Val.UserOrigin] == nil {
					foreignersMap[t.Val.UserOrigin] = []models.GroupMember{}
				}
				if excepDict[t.Key] {
					foreignersMap[t.Val.UserOrigin] = append(foreignersMap[t.Val.UserOrigin], t.Val)
				}
			}
		}
		for k, v := range foreignersMap {
			p.ToOuterOrigin(k, models.OriginPacket{IsResponse: false, Key: "groupUpdate " + key, GroupId: groupId, Exceptions: v, Data: string(message)})
		}
	}
}

func (p *Pusher) JoinGroup(groupId int64, userId int64, userOrigin string) {
	g, ok := p.RetriveGroup(groupId)
	if ok {
		g.Set(fmt.Sprintf("%d", userId)+"@"+userOrigin, models.GroupMember{UserId: userId, UserOrigin: userOrigin})
	}
}

func (p *Pusher) LeaveGroup(groupId int64, userId int64, userOrigin string) {
	g, ok := p.RetriveGroup(groupId)
	if ok {
		g.Remove(fmt.Sprintf("%d", userId) + "@" + userOrigin)
	}
}

func (p *Pusher) RetriveGroup(groupId int64) (*cmap.ConcurrentMap[string, models.GroupMember], bool) {
	ok := p.Groups.Has(fmt.Sprintf("%d", groupId))
	if !ok {
		newMap := cmap.New[models.GroupMember]()
		p.Groups.SetIfAbsent(fmt.Sprintf("%d", groupId), &newMap)
	}
	return p.Groups.Get(fmt.Sprintf("%d", groupId))
}

func CreatePusher(appId string, toOuterOrigin func(string, models.OriginPacket)) *Pusher {
	utils.Log(5, "running network...")
	utils.LoadValidationSystem()
	newMap := cmap.New[*cmap.ConcurrentMap[string, models.GroupMember]]()
	return &Pusher{
		appId:         appId,
		Clients:       map[int64]func([]byte){},
		Groups:        &newMap,
		ToOuterOrigin: toOuterOrigin,
	}
}
