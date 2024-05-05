package dtos_workers

type DeleteDto struct {
	WorkerId  int64  `json:"workerId" validate:"required"`
	TowerId   int64  `json:"towerId" validate:"required"`
	RoomId    int64  `json:"roomId" validate:"required"`
}

func (d DeleteDto) GetData() any {
	return "dummy"
}

func (d DeleteDto) GetTowerId() int64 {
	return d.TowerId
}

func (d DeleteDto) GetRoomId() int64 {
	return d.RoomId
}
