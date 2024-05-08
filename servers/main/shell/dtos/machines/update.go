package dtos_machines

type UpdateDto struct {
	MachineId  int64  `json:"machineId" validate:"required"`
	Name     string `json:"name" validate:"required"`
	AvatarId int64  `json:"avatarId"`
}

func (d UpdateDto) GetData() any {
	return "dummy"
}

func (d UpdateDto) GetTowerId() int64 {
	return 0
}

func (d UpdateDto) GetRoomId() int64 {
	return 0
}

func (d UpdateDto) GetWorkerId() int64 {
	return 0
}
