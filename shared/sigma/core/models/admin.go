package models

type Admin struct {
	Id      string `json:"id"`
	SpaceId string `json:"spaceId"`
	Role    string `json:"role"`
}
