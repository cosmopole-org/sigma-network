package dtos_machines

type GetDto struct {
	MachineId  string  `json:"machineId" validate:"required"`
}

func (d GetDto) GetData() any {
	return "dummy"
}
