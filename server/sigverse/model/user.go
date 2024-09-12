package model

import (
	"sigma/sigma/lib/datatypes"
)

type User struct {
	Id        string         `json:"id" gorm:"primaryKey;column:id"`
	Number    int            `json:"number" gorm:"autoIncrement;column:number"`
	Type      string         `json:"type" gorm:"column:type"`
	Username  string         `json:"username" gorm:"column:username;uniqueIndex"`
	Name      string         `json:"name" gorm:"column:name"`
	Avatar    string         `json:"avatar" gorm:"column:avatar"`
	Secret    string         `json:"secret" gorm:"column:secret"`
	PublicKey string         `json:"publicKey" gorm:"column:public_key"`
	Metadata  datatypes.JSON `json:"metadata" gorm:"column:metadata"`
}

type PublicUser struct {
	Id        string `json:"id" gorm:"column:id"`
	Type      string `json:"type" gorm:"column:type"`
	Username  string `json:"username" gorm:"column:username"`
	Name      string `json:"name" gorm:"column:name"`
	Avatar    string `json:"avatar" gorm:"column:avatar"`
	PublicKey string `json:"publicKey" gorm:"column:public_key"`
}
