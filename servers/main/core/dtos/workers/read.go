package dtos_workers

type ReadDto struct {
	TowerId   int64  `json:"towerId" validate:"required"`
	RoomId    int64  `json:"roomId" validate:"required"`
}

func (d ReadDto) GetData() any {
	return "dummy"
}

func (d ReadDto) GetTowerId() int64 {
	return d.TowerId
}

func (d ReadDto) GetRoomId() int64 {
	return d.RoomId
}
