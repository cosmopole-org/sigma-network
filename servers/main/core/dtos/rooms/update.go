package dtos_rooms

type UpdateDto struct {
	RoomId   int64  `json:"roomId" validate:"required"`
	Name     string `json:"name" validate:"required"`
	AvatarId int64  `json:"avatarId"`
}

func (d UpdateDto) GetData() any {
	return "dummy"
}
