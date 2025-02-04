package model

type Invite struct {
	Id      string `json:"id" gorm:"primaryKey;column:id"`
	UserId  string `json:"humanId" gorm:"column:user_id"`
	SpaceId string `json:"spaceId" gorm:"column:space_id"`
}

func (d Invite) Type() string {
	return "Invite"
}
