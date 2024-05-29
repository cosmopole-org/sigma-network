package models

type Member struct {
	Id       string `json:"id"`
	UserId   string `json:"humanId"`
	SpaceId  string `json:"spaceId"`
	TopicIds string `json:"topicIds"`
	Metadata string `json:"metadata"`
}
