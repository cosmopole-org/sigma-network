package updates_rooms

type Send struct {
	TowerId    int64  `json:"towerId"`
	RoomId     int64  `json:"roomId"`
	UserId     int64  `json:"userId"`
	UserType   string `json:"userType"`
	UserOrigin string `json:"userOrigin"`
	Action     string `json:"action"`
	Data       string `json:"data"`
}
