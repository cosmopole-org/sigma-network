package dtos_towers

type GetDto struct {
	TowerId  int64  `json:"towerId" validate:"required"`
}

func (d GetDto) GetData() any {
	return "dummy"
}
