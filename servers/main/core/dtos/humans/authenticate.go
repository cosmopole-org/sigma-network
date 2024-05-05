package dtos_humans

type AuthenticateDto struct{}

func (d AuthenticateDto) GetData() any {
	return "dummy"
}

func (d AuthenticateDto) GetTowerId() int64 {
	return 0
}

func (d AuthenticateDto) GetRoomId() int64 {
	return 0
}
