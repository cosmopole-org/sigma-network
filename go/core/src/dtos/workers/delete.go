package dtos_workers

type DeleteDto struct {
	WorkerId  int64  `json:"workerId" validate:"required"`
}

func (d DeleteDto) GetData() any {
	return "dummy"
}
