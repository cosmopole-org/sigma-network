package dtos_workers

type DeliverDto struct {
	WorkerId int64  `json:"workerId" validate:"required"`
	Data     string `json:"data" validate:"required"`
	UserId   int64  `json:"userId"`
}

func (d DeliverDto) GetData() any {
	return "dummy"
}
