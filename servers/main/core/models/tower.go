package models

type Tower struct {
	Id        int64  `json:"id"`
	Name      string `json:"name"`
	AvatarId  int64  `json:"avatarId"`
	IsPublic  bool   `json:"isPublic"`
	CreatorId int64  `json:"creatorId"`
}
