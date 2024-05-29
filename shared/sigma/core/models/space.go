package models

type Space struct {
	Id       string `json:"id"`
	Username string `json:"username"`
	Title    string `json:"name"`
	Avatar   string `json:"avatar"`
	IsPublic bool   `json:"isPublic"`
}
