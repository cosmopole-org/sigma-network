package dtos_rooms

type CreateDto struct {
	Name     string `json:"name" validate:"required"`
	AvatarId int64  `json:"avatarId"`
	TowerId  int64  `json:"towerId" validate:"required"`
}

func (d CreateDto) GetData() any {
	return "dummy"
}

func (d CreateDto) GetTowerId() int64 {
	return d.TowerId
}

func (d CreateDto) GetRoomId() int64 {
	return 0
}
