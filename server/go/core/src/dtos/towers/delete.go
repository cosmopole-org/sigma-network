package dtos_towers

type DeleteDto struct {
	TowerId  int64  `json:"towerId" validate:"required"`
}

func (d DeleteDto) GetData() any {
	return "dummy"
}
