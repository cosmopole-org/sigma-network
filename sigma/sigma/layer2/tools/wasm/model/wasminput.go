package model

type WasmInput struct {
	Data string
}

func (d WasmInput) GetSpaceId() string {
	return ""
}

func (d WasmInput) GetTopicId() string {
	return ""
}

func (d WasmInput) GetMemberId() string {
	return ""
}
