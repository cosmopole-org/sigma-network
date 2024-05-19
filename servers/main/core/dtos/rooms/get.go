package dtos_rooms

type GetDto struct {
	RoomId  int64 `json:"roomId" validate:"required"`
	TowerId int64 `json:"towerId" validate:"required"`
}

func (d GetDto) GetData() any {
	return "dummy"
}

func (d GetDto) GetTowerId() int64 {
	return d.TowerId
}

func (d GetDto) GetRoomId() int64 {
	return d.RoomId
}

func (d GetDto) GetWorkerId() int64 {
	return 0
}
