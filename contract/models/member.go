package models

type Member struct {
	Id       string `json:"id" gorm:"primaryKey;column:id"`
	UserId   string `json:"humanId" gorm:"column:user_id"`
	SpaceId  string `json:"spaceId" gorm:"column:space_id"`
	TopicId  string `json:"topicId" gorm:"column:topic_ids"`
	Metadata string `json:"metadata" gorm:"column:metadata"`
}
