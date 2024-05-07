package updates_workers

type Delivery struct {
	TowerId    int64  `json:"towerId"`
	RoomId     int64  `json:"roomId"`
	WorkerId   int64  `json:"workerId"`
	UserId     int64  `json:"userId"`
	UserType   string `json:"userType"`
	MachineId  int64  `json:"machineId"`
	Data       string `json:"data"`
	UserOrigin string `json:"userOrigin"`
}
