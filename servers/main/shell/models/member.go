package models

type Member struct {
	Id      int64 `json:"id"`
	HumanId int64 `json:"humanId"`
	TowerId int64 `json:"towerId"`
}
