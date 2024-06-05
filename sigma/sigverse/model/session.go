package module_model

type Session struct {
	Id     string `json:"id" gorm:"primaryKey;column:id"`
	UserId string `json:"userId" gorm:"column:user_id"`
	Token  string `json:"token" gorm:"column:token"`
}
