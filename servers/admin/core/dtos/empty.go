package dtos

type EmptyDto struct {
	
}

func (d EmptyDto) GetData() any {
	return "dummy"
}
