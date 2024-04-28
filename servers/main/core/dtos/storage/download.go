package dtos_storage

type DownloadDto struct {
	FileKey string `json:"fileKey" validate:"required"`
}

func (d DownloadDto) GetData() any {
	return "dummy"
}
