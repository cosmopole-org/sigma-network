package dtos_workers

type UpdateDto struct {
	WorkerId int64  `json:"workerId" validate:"required"`
	Metadata string `json:"metadata" validate:"required"`
}

func (d UpdateDto) GetData() any {
	return "dummy"
}
