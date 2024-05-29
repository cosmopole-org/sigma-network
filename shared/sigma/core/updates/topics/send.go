package updates_topics

type Send struct {
	SpaceId    int64  `json:"spaceId"`
	TopicId    int64  `json:"topicId"`
	UserId     int64  `json:"userId"`
	UserType   string `json:"userType"`
	UserOrigin string `json:"userOrigin"`
	Action     string `json:"action"`
	Data       string `json:"data"`
}
