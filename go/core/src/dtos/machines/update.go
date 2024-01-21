package dtos_machines

type UpdateDto struct {
	MachineId  int64  `json:"machineId" validate:"required"`
	Name     string `json:"name" validate:"required"`
	AvatarId int64  `json:"avatarId"`
}

func (d UpdateDto) GetData() any {
	return "dummy"
}
