package dtos_machines

type DeleteDto struct {
	MachineId  int64  `json:"machineId" validate:"required"`
}

func (d DeleteDto) GetData() any {
	return "dummy"
}
