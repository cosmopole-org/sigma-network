package dtos

type HelloDto struct {}

func (d HelloDto) GetData() any {
	return "dummy"
}

func (d HelloDto) GetTowerId() int64 {
	return 0
}

func (d HelloDto) GetRoomId() int64 {
	return 0
}

func (d HelloDto) GetWorkerId() int64 {
	return 0
}
