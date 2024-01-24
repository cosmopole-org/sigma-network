package dtos_workers

type DeliverDto struct {
	WorkerId int64 `json:"workerId" validate:"required"`
	Data     any   `json:"data" validate:"required"`
}

func (d DeliverDto) GetData() any {
	return "dummy"
}
