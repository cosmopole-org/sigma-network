package actor

import (
	"sigma/sigma/abstract"
	moduleactormodel "sigma/sigma/core/module/actor/model"
	"sigma/sigma/layer1/module/toolbox"
)

type Guard struct {
	IsUser    bool `json:"isUser"`
	IsInSpace bool `json:"isInSpace"`
	IsInTopic bool `json:"isInTopic"`
}

func (g *Guard) ValidateOnlyToken(layer abstract.ILayer, token string) (bool, string) {
	userId, _, _ := abstract.UseToolbox[*toolbox.ToolboxL1](layer.Core().Get(1).Tools()).Security().AuthWithToken(token)
	return true, userId
}

func (g *Guard) ValidateByToken(layer abstract.ILayer, token string, spaceId string, topicId string, memberId string) (bool, *moduleactormodel.Info) {
	if !g.IsUser {
		return true, moduleactormodel.NewInfo("", "", "")
	}
	security := abstract.UseToolbox[toolbox.IToolboxL1](layer.Tools()).Security()
	userId, userType, isGod := security.AuthWithToken(token)
	if userId == "" {
		return false, &moduleactormodel.Info{}
	}
	if !g.IsInSpace {
		return true, moduleactormodel.NewGodInfo(userId, "", "", isGod)
	}
	location := security.HandleLocationWithProcessed(token, userId, userType, spaceId, topicId, memberId)
	if location.SpaceId == "" {
		return false, &moduleactormodel.Info{}
	}
	return true, moduleactormodel.NewGodInfo(userId, location.SpaceId, location.TopicId, isGod)
}

func (g *Guard) ValidateByUserId(userId string, spaceId string, topicId string) (bool, *moduleactormodel.Info) {
	return true, moduleactormodel.NewInfo("123", spaceId, topicId)
}
