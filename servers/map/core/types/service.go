package types

import (
	"fmt"
	"sigma/map/core/interfaces"
)

type Service struct {
	app     interfaces.IApp
	key     string
	methods map[string]interfaces.IMethod
}

func (s *Service) AddGrpcLoader(fn func()) {
	fn()
}

func (s *Service) AddMethod(method interfaces.IMethod) {
	s.methods[method.GetKey()] = method
}

func (s *Service) GetMethod(key string) interfaces.IMethod {
	return s.methods[key]
}

func (s *Service) CallMethod(key string, dto interface{}, meta interfaces.Meta) (any, error) {
	var method = s.GetMethod(key)
	return method.GetCallback()(s.app, dto, CreateAssistant(meta.UserId, "human", meta.TowerId, meta.RoomId, 0, nil))
}

func (s *Service) GetKey() string {
	return s.key
}

func (s *Service) SetKey(key string) {
	s.key = key
}

func (s *Service) SetMethods(methods map[string]interfaces.IMethod) {
	fmt.Println(methods)
	s.methods = methods
}

func CreateService(app interfaces.IApp, key string) interfaces.IService {
	return &Service{app: app, key: key, methods: map[string]interfaces.IMethod{}}
}
