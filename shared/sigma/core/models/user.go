package models

type User struct {
	Id       string `json:"id"`
	Type     string `json:"type"`
	Username string `json:"username"`
	Name     string `json:"name"`
	Avatar   string `json:"avatar"`
	Secret   string `json:"secret"`
}
