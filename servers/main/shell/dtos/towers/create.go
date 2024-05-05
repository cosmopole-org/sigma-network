package dtos_towers

type CreateDto struct {
	Name     string `json:"name" validate:"required"`
	AvatarId int64  `json:"avatarId"`
	IsPublic bool   `json:"isPublic"`
}

func (d CreateDto) GetData() any {
	return "dummy"
}

func (d CreateDto) GetTowerId() int64 {
	return 0
}

func (d CreateDto) GetRoomId() int64 {
	return 0
}
