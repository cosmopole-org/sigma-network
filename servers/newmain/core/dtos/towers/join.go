package dtos_towers

type JoinDto struct {
	TowerId int64 `json:"towerId" validate:"required"`
}

func (d JoinDto) GetData() any {
	return "dummy"
}
