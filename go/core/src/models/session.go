package models

type Session struct {
	Id     int64  `json:"id"`
	UserId int64  `json:"userId"`
	Token  string `json:"token"`
}
