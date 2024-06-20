package module_actor_model

import "strings"

type Info struct {
	userId  string
	spaceId string
	topicId string
}

func NewInfo(userId string, spaceId string, topicId string) *Info {
	return &Info{userId: userId, spaceId: spaceId, topicId: topicId}
}

func (info *Info) UserId() string {
	return info.userId
}

func (info *Info) SpaceId() string {
	return info.spaceId
}

func (info *Info) TopicId() string {
	return info.topicId
}

func (info *Info) Identity() (string, string) {
	identity := strings.Split(info.userId, "@")
	if len(identity) == 2 {
		return identity[0], identity[1]
	}
	return "", ""
}
