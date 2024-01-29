package cosmopole_dtos_messenger

type ReadDto struct {
	Offset string `json:"offset"`
	Count  string `json:"count"`
}

func (d ReadDto) GetData() any {
	return "dummy"
}
