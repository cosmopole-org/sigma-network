package model

import "gorm.io/datatypes"

type Message struct {
	Id       string `json:"id" gorm:"primaryKey;column:id"`
	SpaceId  string `json:"spaceId" gorm:"column:space_id"`
	TopicId  string `json:"topicId" gorm:"column:topic_id"`
	AuthorId string `json:"authorId" gorm:"column:author_id"`
	Data     Json   `json:"data" gorm:"column:data"`
	Time     int64  `json:"time" gorm:"column:time"`
}

func (m Message) Type() string {
	return "Message"
}

type ResultMessage struct {
	Id       string         `json:"id" gorm:"primaryKey;column:id"`
	SpaceId  string         `json:"spaceId" gorm:"column:space_id"`
	TopicId  string         `json:"topicId" gorm:"column:topic_id"`
	AuthorId string         `json:"authorId" gorm:"column:author_id"`
	Data     Json           `json:"data" gorm:"column:data"`
	Time     int64          `json:"time" gorm:"column:time"`
	Author   datatypes.JSON `json:"author"`
}
