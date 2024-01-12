package types

type IApp interface {
	AddService(s *Service)
	GetService(key string) *Service
	Listen(port int)
}
