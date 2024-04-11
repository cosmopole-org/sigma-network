package dtos_towers

type CreateDto struct {
	Name     string `json:"name" validate:"required"`
	AvatarId int64  `json:"avatarId"`
	IsPublic bool   `json:"isPublic"`
}

func (d CreateDto) GetData() any {
	return "dummy"
}
