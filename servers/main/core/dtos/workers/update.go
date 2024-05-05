package dtos_workers

type UpdateDto struct {
	WorkerId int64  `json:"workerId" validate:"required"`
	Metadata string `json:"metadata" validate:"required"`
	TowerId  int64  `json:"towerId" validate:"required"`
	RoomId   int64  `json:"roomId" validate:"required"`
}

func (d UpdateDto) GetData() any {
	return "dummy"
}

func (d UpdateDto) GetTowerId() int64 {
	return d.TowerId
}

func (d UpdateDto) GetRoomId() int64 {
	return d.RoomId
}
