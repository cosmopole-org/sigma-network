package dtos_workers

type CreateDto struct {
	MachineId    int64  `json:"machineId" validate:"required"`
	Metadata     string `json:"metadata" validate:"required"`
	TowerId      int64  `json:"towerId" validate:"required"`
	RoomId       int64  `json:"roomId" validate:"required"`
	WorkerOrigin string `json:"workerOrigin" validate:"required"`
}

func (d CreateDto) GetData() any {
	return "dummy"
}

func (d CreateDto) GetTowerId() int64 {
	return d.TowerId
}

func (d CreateDto) GetRoomId() int64 {
	return d.RoomId
}
