package models

type Admin struct {
	Id        int64  `json:"id"`
	HumanId   int64  `json:"humanId"`
	Email     string `json:"email"`
	Password  string `json:"password"`
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
}
