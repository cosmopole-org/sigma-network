package dtos_workers

type DeliverDto struct {
	WorkerId int64  `json:"workerId" validate:"required"`
	Data     string `json:"data" validate:"required"`
	UserId   int64  `json:"userId"`
	TowerId  int64  `json:"towerId" validate:"required"`
	RoomId   int64  `json:"roomId" validate:"required"`
}

func (d DeliverDto) GetData() any {
	return "dummy"
}

func (d DeliverDto) GetTowerId() int64 {
	return d.TowerId
}

func (d DeliverDto) GetRoomId() int64 {
	return d.RoomId
}
