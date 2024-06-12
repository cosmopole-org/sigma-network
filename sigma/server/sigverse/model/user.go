package model

type User struct {
	Id        string `json:"id" gorm:"primaryKey;column:id"`
	Type      string `json:"type" gorm:"column:type"`
	Username  string `json:"username" gorm:"column:username"`
	Name      string `json:"name" gorm:"column:name"`
	Avatar    string `json:"avatar" gorm:"column:avatar"`
	Secret    string `json:"secret" gorm:"column:secret"`
	PublicKey string `json:"publicKey" gorm:"column:public_key"`
}

type PublicUser struct {
	Id        string `json:"id" gorm:"primaryKey;column:id"`
	Type      string `json:"type" gorm:"column:type"`
	Username  string `json:"username" gorm:"column:username"`
	Name      string `json:"name" gorm:"column:name"`
	Avatar    string `json:"avatar" gorm:"column:avatar"`
	PublicKey string `json:"publicKey" gorm:"column:public_key"`
}
