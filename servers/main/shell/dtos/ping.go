package dtos

type PingDto struct {
	
}

func (d PingDto) GetData() any {
	return "dummy"
}

func (d PingDto) GetTowerId() int64 {
	return 0
}

func (d PingDto) GetRoomId() int64 {
	return 0
}
