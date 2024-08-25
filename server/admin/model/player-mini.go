package admin_model

type PlayerMini struct {
	Id         string  `json:"id"`
	Coin       int64  `json:"coin"`
	Gem        int64  `json:"gem"`
	Energy     int32  `json:"energy"`
	Email      string `json:"email"`
	PlayerName string `json:"playerName"`
}
