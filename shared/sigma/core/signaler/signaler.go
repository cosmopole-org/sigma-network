package signaler

import (
	"encoding/json"
	"sigma/main/core/models"
	"sigma/main/core/adapters/federation"
	"sigma/main/core/utils"
	"strings"

	cmap "github.com/orcaman/concurrent-map/v2"
)

const groupUpdatePrefix = "groupUpdate "
const updatePrefix = "update "
const responsePrefix = "response "

type Signaler struct {
	appId      string
	Listeners  map[string]*models.Listener
	Groups     *cmap.ConcurrentMap[string, *cmap.ConcurrentMap[string, string]]
	Federation federation.IFederation
}

func (p *Signaler) SignalUser(key string, respondToId string, listenerId string, data any, pack bool) {
	origin := strings.Split(listenerId, "@")[1]
	if origin == p.appId {
		listener := p.Listeners[listenerId]
		if listener != nil {
			if pack {
				var message string
				switch d := data.(type) {
				case string:
					message = d
				default:
					msg, err := json.Marshal(d)
					if err != nil {
						utils.Log(5, err)
						return
					}
					message = string(msg)
				}
				if len(respondToId) > 0 {
					listener.Signal([]byte(responsePrefix + respondToId + " " + message))
				} else {
					listener.Signal([]byte(updatePrefix+ key + " " + message))
				}
			} else {
				listener.Signal(data)
			}
		}
	} else {
		var message string
		switch d := data.(type) {
		case string:
			message = d
		default:
			msg, err := json.Marshal(d)
			if err != nil {
				utils.Log(5, err)
				return
			}
			message = string(msg)
		}
		p.Federation.SendInFederation(origin, models.OriginPacket{IsResponse: false, Key: updatePrefix + key, UserId: listenerId, Data: message})
	}
}

func (p *Signaler) SignalGroup(key string, groupId string, data any, pack bool, exceptions []string) {
	var excepDict = map[string]bool{}
	for _, exc := range exceptions {
		excepDict[exc] = true
	}
	group, ok := p.RetriveGroup(groupId)
	if ok {
		var packet any
		if pack {
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
			packet = []byte(updatePrefix + key + " " + string(message))
		} else {
			packet = data
		}
		var foreignersMap = map[string][]string{}
		for t := range group.IterBuffered() {
			userId := t.Val
			userOrigin := strings.Split(userId, "@")[1]
			if userOrigin == p.appId {
				if !excepDict[t.Key] {
					var listener = p.Listeners[userId]
					if listener != nil {
						listener.Signal(packet)
					}
				}
			} else {
				if foreignersMap[userOrigin] == nil {
					foreignersMap[userOrigin] = []string{}
				}
				if excepDict[t.Key] {
					foreignersMap[userOrigin] = append(foreignersMap[userOrigin], t.Val)
				}
			}
		}
		var message string
		switch d := data.(type) {
		case string:
			message = d
		default:
			msg, err := json.Marshal(d)
			if err != nil {
				utils.Log(5, err)
				return
			}
			message = string(msg)
		}
		for k, v := range foreignersMap {
			p.Federation.SendInFederation(k, models.OriginPacket{IsResponse: false, Key: groupUpdatePrefix + key, SpaceId: groupId, Exceptions: v, Data: message})
		}
	}
}

func (p *Signaler) JoinGroup(groupId string, userId string) {
	g, ok := p.RetriveGroup(groupId)
	if ok {
		g.Set(userId, userId)
	}
}

func (p *Signaler) LeaveGroup(groupId string, userId string) {
	g, ok := p.RetriveGroup(groupId)
	if ok {
		g.Remove(userId)
	}
}

func (p *Signaler) RetriveGroup(groupId string) (*cmap.ConcurrentMap[string, string], bool) {
	ok := p.Groups.Has(groupId)
	if !ok {
		newMap := cmap.New[string]()
		p.Groups.SetIfAbsent(groupId, &newMap)
	}
	return p.Groups.Get(groupId)
}

func CreateSignaler(appId string, federation federation.IFederation) *Signaler {
	utils.Log(5, "creating signaler...")
	utils.LoadValidationSystem()
	newMap := cmap.New[*cmap.ConcurrentMap[string, string]]()
	return &Signaler{
		appId:      appId,
		Listeners:  map[string]*models.Listener{},
		Groups:     &newMap,
		Federation: federation,
	}
}
