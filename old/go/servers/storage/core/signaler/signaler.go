package signaler

import (
	"encoding/json"
	"sigma/storage/core/adapters/federation"
	"sigma/storage/core/models"
	"sigma/storage/core/utils"
	"strings"

	cmap "github.com/orcaman/concurrent-map/v2"
)

const groupUpdatePrefix = "groupUpdate "
const updatePrefix = "update "
const responsePrefix = "response "

type Group struct {
	Points   *cmap.ConcurrentMap[string, string]
	Listener *models.Listener
	Override bool
}

type Signaler struct {
	appId          string
	Listeners      map[string]*models.Listener
	Groups         *cmap.ConcurrentMap[string, *Group]
	GlobalBridge   *models.GlobalListener
	LGroupDisabled bool
	Federation     federation.IFederation
}

func (p *Signaler) ListenToSingle(listener *models.Listener) {
	p.Listeners[listener.Id] = listener
}

func (p *Signaler) ListenToGroup(listener *models.Listener, overrideFunctionaly bool) {
	g, _ := p.RetriveGroup(listener.Id)
	g.Listener = listener
	g.Override = overrideFunctionaly
}

func (p *Signaler) BrdigeGlobally(listener *models.GlobalListener, overrideFunctionaly bool) {
	p.LGroupDisabled = true
	p.GlobalBridge = listener
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
					listener.Signal([]byte(updatePrefix + key + " " + message))
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
		if group.Override {
			group.Listener.Signal(packet)
		}
		var foreignersMap = map[string][]string{}
		for t := range group.Points.IterBuffered() {
			userId := t.Val
			userOrigin := strings.Split(userId, "@")[1]
			if userOrigin == p.appId {
				if !p.LGroupDisabled || !group.Override {
					if !excepDict[t.Key] {
						var listener = p.Listeners[userId]
						if listener != nil {
							listener.Signal(packet)
						}
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
		g.Points.Set(userId, userId)
	}
}

func (p *Signaler) LeaveGroup(groupId string, userId string) {
	g, ok := p.RetriveGroup(groupId)
	if ok {
		g.Points.Remove(userId)
	}
}

func (p *Signaler) RetriveGroup(groupId string) (*Group, bool) {
	ok := p.Groups.Has(groupId)
	if !ok {
		newMap := cmap.New[string]()
		group := &Group{Points: &newMap, Listener: nil, Override: false}
		p.Groups.SetIfAbsent(groupId, group)
	}
	return p.Groups.Get(groupId)
}

func CreateSignaler(appId string, federation federation.IFederation) *Signaler {
	utils.Log(5, "creating signaler...")
	utils.LoadValidationSystem()
	newMap := cmap.New[*Group]()
	return &Signaler{
		appId:          appId,
		Listeners:      map[string]*models.Listener{},
		Groups:         &newMap,
		LGroupDisabled: false,
		Federation:     federation,
		GlobalBridge:   nil,
	}
}
