package model

type File struct {
	Id       string `json:"id" gorm:"primaryKey;column:id"`
	TopicId  string `json:"topicId" gorm:"column:topic_id"`
	SenderId string `json:"senderId" gorm:"column:sender_id"`
}

func (d File) Type() string {
	return "File"
}
