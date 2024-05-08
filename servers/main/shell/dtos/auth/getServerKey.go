package dtos_auth

type GetServerKey struct{}

func (d GetServerKey) GetData() any {
	return "dummy"
}

func (d GetServerKey) GetTowerId() int64 {
	return 0
}

func (d GetServerKey) GetRoomId() int64 {
	return 0
}

func (d GetServerKey) GetWorkerId() int64 {
	return 0
}
