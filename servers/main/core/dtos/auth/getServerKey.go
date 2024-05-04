package dtos_auth

type GetServerKey struct{}

func (d GetServerKey) GetData() any {
	return "dummy"
}
