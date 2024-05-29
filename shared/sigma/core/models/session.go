package models

type Session struct {
	Id     string `json:"id"`
	UserId string `json:"userId"`
	Token  string `json:"token"`
}
