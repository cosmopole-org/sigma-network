package cosmopole_dtos_messenger

type UpdateDto struct {
	MessageId int64  `json:"messageId" validate:"required"`
	Data      string `json:"data" validate:"required"`
}

func (d UpdateDto) GetData() any {
	return "dummy"
}
