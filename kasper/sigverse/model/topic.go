package model

type Topic struct {
	Id      string `json:"id" gorm:"primaryKey;column:id"`
	Title   string `json:"title" gorm:"column:title"`
	Avatar  string `json:"avatar" gorm:"column:avatar"`
	SpaceId string `json:"spaceId" gorm:"column:space_id"`
}

func (d Topic) Type() string {
	return "Topic"
}
