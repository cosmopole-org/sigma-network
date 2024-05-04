package dtos_towers

type UpdateDto struct {
	TowerId  int64  `json:"towerId" validate:"required"`
	Name     string `json:"name" validate:"required"`
	AvatarId int64  `json:"avatarId"`
	IsPublic bool   `json:"isPublic"`
}

func (d UpdateDto) GetData() any {
	return "dummy"
}
