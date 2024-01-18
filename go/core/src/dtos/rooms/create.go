package dtos_rooms

type CreateDto struct {
	Name     string `json:"name" validate:"required"`
	AvatarId int64  `json:"avatarId"`
}

func (d CreateDto) GetData() any {
	return "dummy"
}