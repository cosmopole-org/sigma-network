package model

import (
	"gorm.io/datatypes"
)

type User struct {
	Id        string         `json:"id" gorm:"primaryKey;column:id"`
	Number    int            `json:"number" gorm:"autoIncrement;column:number"`
	Typ       string         `json:"type" gorm:"column:type"`
	Username  string         `json:"username" gorm:"uniqueIndex;column:username"`
	Name      string         `json:"name" gorm:"column:name"`
	Avatar    string         `json:"avatar" gorm:"column:avatar"`
	Secret    string         `json:"secret" gorm:"column:secret"`
	PublicKey string         `json:"publicKey" gorm:"column:public_key"`
	Metadata  datatypes.JSON `json:"-" gorm:"column:metadata"`
}

func (d User) Type() string {
	return "User"
}

type PublicUser struct {
	Id        string `json:"id" gorm:"column:id"`
	Type      string `json:"type" gorm:"column:type"`
	Username  string `json:"username" gorm:"column:username"`
	Name      string `json:"name" gorm:"column:name"`
	Avatar    string `json:"avatar" gorm:"column:avatar"`
	PublicKey string `json:"publicKey" gorm:"column:public_key"`
}
