package actor

import moduleactormodel "sigma/sigma/core/module/actor/model"

type Guard struct {
	IsUser    bool `json:"isUser"`
	IsInSpace bool `json:"isInSpace"`
	IsInTopic bool `json:"isInTopic"`
}

func (g *Guard) ValidateOnlyToken(token string) (bool, string) {
	return true, "123"
}

func (g *Guard) ValidateByToken(token string, spaceId string, topicId string) (bool, *moduleactormodel.Info) {
	return true, moduleactormodel.NewInfo("123", spaceId, topicId)
}

func (g *Guard) ValidateByUserId(userId string, spaceId string, topicId string) (bool, *moduleactormodel.Info) {
	return true, moduleactormodel.NewInfo("123", spaceId, topicId)
}
