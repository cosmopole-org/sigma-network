package models

type Pending struct {
	Id         int64  `json:"id"`
	Email      string `json:"email"`
	VerifyCode string `json:"verifyCode"`
	ClientCode string `json:"clientCode"`
	State      string `json:"state"`
}
