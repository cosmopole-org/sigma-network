package cosmopole_dtos_messenger

type ReadDto struct {
	Offset int64 `json:"offset" validate:"required"`
	Count  int64 `json:"count" validate:"required"`
}

func (d ReadDto) GetData() any {
	return "dummy"
}
