package dtos_auth

type GetServersMapDto struct{}

func (d GetServersMapDto) GetData() any {
	return "dummy"
}

func (d GetServersMapDto) GetTowerId() int64 {
	return 0
}

func (d GetServersMapDto) GetRoomId() int64 {
	return 0
}

func (d GetServersMapDto) GetWorkerId() int64 {
	return 0
}
