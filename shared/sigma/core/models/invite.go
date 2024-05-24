package models

type Invite struct {
	Id         int64  `json:"id"`
	HumanId    int64  `json:"humanId"`
	TowerId    int64  `json:"towerId"`
	UserOrigin string `json:"userOrigin"`
}
