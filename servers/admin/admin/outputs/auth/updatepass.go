package outputs_auth

type UpdatePassOutput struct{}

func (d UpdatePassOutput) GetData() any {
	return "dummy"
}

func (d UpdatePassOutput) GetTowerId() int64 {
	return 0
}

func (d UpdatePassOutput) GetRoomId() int64 {
	return 0
}

func (d UpdatePassOutput) GetWorkerId() int64 {
	return 0
}
