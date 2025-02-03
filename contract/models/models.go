package models

type Player struct {
	UserId   string `json:"userId"`
	MemberId string `json:"memberId"`
	TeamId   string `json:"teamId"`
}

type Team struct {
	Id        string  `json:"id"`
	Score     float64 `json:"score"`
	MainScore float64 `json:"mainScore"`
}
