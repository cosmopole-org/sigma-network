package dtos

type PingDto struct {
	
}

func (d PingDto) GetData() any {
	return "dummy"
}
