package dtos_rooms

type UpdateDto struct {
	RoomId   int64  `json:"roomId" validate:"required"`
	Name     string `json:"name" validate:"required"`
	AvatarId int64  `json:"avatarId"`
	TowerId int64 `json:"towerId" validate:"required"`
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
