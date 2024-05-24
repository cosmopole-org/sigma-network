package dtos

type EmptyDto struct {
	
}

func (d EmptyDto) GetData() any {
	return "dummy"
}

func (d EmptyDto) GetTowerId() int64 {
	return 0
}

func (d EmptyDto) GetRoomId() int64 {
	return 0
}

func (d EmptyDto) GetWorkerId() int64 {
	return 0
}
