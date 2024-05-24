package dtos_storage

type DownloadDto struct {
	FileKey string `json:"fileKey" validate:"required"`
	TowerId int64  `json:"towerId" validate:"required"`
	RoomId  int64  `json:"roomId" validate:"required"`
}

func (d DownloadDto) GetData() any {
	return "dummy"
}

func (d DownloadDto) GetTowerId() int64 {
	return d.TowerId
}

func (d DownloadDto) GetRoomId() int64 {
	return d.RoomId
}

func (d DownloadDto) GetWorkerId() int64 {
	return d.RoomId
}

