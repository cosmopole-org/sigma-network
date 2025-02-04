package adapters_model

type DataUnit struct {
	Id       string `json:"id" gorm:"primaryKey;column:id"`
	TopicId  string `json:"topicId" gorm:"primaryKey;column:topic_id"`
	MemberId string `json:"memberId" gorm:"primaryKey;column:member_id"`
	Data     string `json:"data" gorm:"column:data"`
}

func (d DataUnit) Type() string {
	return "DataUnit"
}
