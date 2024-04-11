package dtos_rooms

type GetDto struct {
	RoomId  string `json:"roomId" validate:"required"`
}

func (d GetDto) GetData() any {
	return "dummy"
}
