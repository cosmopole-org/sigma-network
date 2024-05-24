package dtos_rooms

type SendDto struct {
	Data       string `json:"data" validate:"required"`
	RecvId     int64  `json:"recvId"`
	RecvType   string `json:"recvType"`
	RecvOrigin string `json:"recvOrigin"`
	WorkerId   int64  `json:"workerId"`
	TowerId    int64  `json:"towerId" validate:"required"`
	RoomId     int64  `json:"roomId" validate:"required"`
	Type       string `json:"type" validate:"required"`
}

func (d SendDto) GetData() any {
	return "dummy"
}

func (d SendDto) GetTowerId() int64 {
	return d.TowerId
}

func (d SendDto) GetRoomId() int64 {
	return d.RoomId
}

func (d SendDto) GetWorkerId() int64 {
	return d.WorkerId
}
