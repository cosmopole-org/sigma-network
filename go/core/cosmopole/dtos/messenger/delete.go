package cosmopole_dtos_messenger

type DeleteDto struct {
	MessageId int64  `json:"messageId" validate:"required"`
}

func (d DeleteDto) GetData() any {
	return "dummy"
}
