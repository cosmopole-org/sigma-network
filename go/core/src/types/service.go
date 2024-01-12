package types

import "fmt"

type IService interface {
	
}

type Service struct {
	key     string
	methods map[string]*Method
}

func (s Service) AddMethod(method *Method) *Service {
	s.methods[method.key] = method
	return &s
}

func (s Service) GetMethod(key string) *Method {
	return s.methods[key]
}

func (s Service) CallMethod(key string, args []any) {
	var method = *s.GetMethod(key)
	packet := CreateLogicPacket(args)
	(*method.GetCallback())(&packet)
}

func (s Service) GetKey() string {
	return s.key
}

func (s Service) SetKey(key string) {
	s.key = key
}

func (s Service) SetMethods(methods map[string]*Method) {
	fmt.Println(methods)
	s.methods = methods
}

func CreateService(key string) *Service {
	return &Service{key: key, methods: map[string]*Method{}}
}
