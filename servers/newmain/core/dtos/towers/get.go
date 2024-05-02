package dtos_towers

type GetDto struct {
	TowerId  string  `json:"towerId" validate:"required"`
}

func (d GetDto) GetData() any {
	return "dummy"
}
