package dtos_workers

type CreateDto struct {
	MachineId int64  `json:"machineId" validate:"required"`
	Metadata  string `json:"metadata" validate:"required"`
}

func (d CreateDto) GetData() any {
	return "dummy"
}
