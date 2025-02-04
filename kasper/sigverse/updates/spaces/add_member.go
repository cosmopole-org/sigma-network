package updates_spaces

type AddMember struct {
	SpaceId string `json:"spaceId"`
	TopicId string `json:"topicId"`
	Member  any    `json:"member"`
}
