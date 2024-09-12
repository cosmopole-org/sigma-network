package models

type God struct {
	Id       string `json:"id" gorm:"primaryKey;column:id"`
	UserId   string `json:"userId" gorm:"column:user_id"`
	Name     string `json:"name" gorm:"column:name"`
	Username string `json:"username" gorm:"column:username"`
	Password string `json:"password" gorm:"column:password"`
}
