package models

type Room struct {
	Id       int64  `json:"id"`
	Name     string `json:"name"`
	AvatarId int64  `json:"avatarId"`
	TowerId  int64  `json:"towerId"`
}
