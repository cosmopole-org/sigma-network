package models

type Space struct {
	Id       string `json:"id" gorm:"primaryKey;column:id"`
	Tag      string `json:"username" gorm:"column:tag"`
	Title    string `json:"title" gorm:"column:title"`
	Avatar   string `json:"avatar" gorm:"column:avatar"`
	IsPublic bool   `json:"isPublic" gorm:"column:is_public"`
}
