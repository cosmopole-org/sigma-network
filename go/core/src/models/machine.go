package models

type Machine struct {
	Id        int64  `json:"id"`
	Name      string `json:"name"`
	AvatarId  int64  `json:"avatarId"`
	CreatorId int64  `json:"creatorId"`
}
