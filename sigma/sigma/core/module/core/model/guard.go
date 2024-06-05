package module_actor_model

type Guard struct {
	IsUser    bool
	IsInSpace bool
	IsInTopic bool
}

func (g *Guard) ValidateByToken(token string, spaceId string, topicId string) (bool, Info) {
	return true, Info{"123", spaceId, topicId}
}

func (g *Guard) ValidateByUserId(token string, spaceId string, topicId string) (bool, Info) {
	return true, Info{"123", spaceId, topicId}
}
