package models

type Invite struct {
	Id      string `json:"id"`
	UserId  string `json:"humanId"`
	SpaceId int64  `json:"spaceId"`
}
