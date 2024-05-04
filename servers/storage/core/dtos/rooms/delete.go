package dtos_rooms

type DeleteDto struct {
	RoomId  int64 `json:"roomId" validate:"required"`
}

func (d DeleteDto) GetData() any {
	return "dummy"
}
