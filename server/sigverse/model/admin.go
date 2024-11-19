package model

type Admin struct {
	Id      string `json:"id" gorm:"primaryKey;column:id"`
	UserId  string `json:"userId" gorm:"column:user_id"`
	SpaceId string `json:"spaceId" gorm:"column:space_id"`
	Role    string `json:"role" gorm:"column:role"`
}

func (d Admin) Type() string {
	return "Admin"
}
