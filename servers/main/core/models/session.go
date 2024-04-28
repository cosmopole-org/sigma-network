package models

type Session struct {
	Id           int64  `json:"id"`
	UserId       int64  `json:"userId"`
	CreatureType int32  `json:"creatureType"`
	Token        string `json:"token"`
}
