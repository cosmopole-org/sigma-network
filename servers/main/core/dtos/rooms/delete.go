package dtos_rooms

type DeleteDto struct {
	RoomId  int64 `json:"roomId" validate:"required"`
	TowerId int64 `json:"towerId" validate:"required"`
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
