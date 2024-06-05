package module_actor_model

import "strings"

type Info struct {
	UserId  string
	SpaceId string
	TopicId string
}

func (info *Info) Identity() (string, string) {
	identity := strings.Split(info.UserId, "@")
	if len(identity) == 2 {
		return identity[0], identity[1]
	}
	return "", ""
}
