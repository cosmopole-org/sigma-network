package dtos_workers

type ReadDto struct {}

func (d ReadDto) GetData() any {
	return "dummy"
}
