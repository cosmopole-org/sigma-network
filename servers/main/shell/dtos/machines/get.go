package dtos_machines

type GetDto struct {
	MachineId  string  `json:"machineId" validate:"required"`
}

func (d GetDto) GetData() any {
	return "dummy"
}

func (d GetDto) GetTowerId() int64 {
	return 0
}

func (d GetDto) GetRoomId() int64 {
	return 0
}

func (d GetDto) GetWorkerId() int64 {
	return 0
}
