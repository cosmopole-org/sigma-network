package dtos_machines

type DeleteDto struct {
	MachineId  int64  `json:"machineId" validate:"required"`
}

func (d DeleteDto) GetData() any {
	return "dummy"
}

func (d DeleteDto) GetTowerId() int64 {
	return 0
}

func (d DeleteDto) GetRoomId() int64 {
	return 0
}
