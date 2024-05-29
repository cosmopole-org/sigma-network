package models

type Topic struct {
	Id      string `json:"id"`
	Name    string `json:"name"`
	Avatar  string `json:"avatar"`
	SpaceId string `json:"spaceId"`
}
