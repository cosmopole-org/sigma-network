package types

import (
	"fmt"
	"sigma/core/src/interfaces"
)

type Service struct {
	app     *interfaces.IApp
	key     string
	methods map[string]interfaces.IMethod
}

func (s Service) AddMethod(method interfaces.IMethod) interfaces.IService {
	s.methods[method.GetKey()] = method
	return s
}

func (s Service) GetMethod(key string) interfaces.IMethod {
	return s.methods[key]
}

func (s Service) CallMethod(key string, dto interfaces.IDto, meta interfaces.Meta) (any, error) {
	var method = s.GetMethod(key)
	return method.GetCallback()(s.app, dto, CreateAssistant(meta.UserId, "human", meta.TowerId, meta.RoomId, 0, nil))
}

func (s Service) GetKey() string {
	return s.key
}

func (s Service) SetKey(key string) {
	s.key = key
}

func (s Service) SetMethods(methods map[string]interfaces.IMethod) {
	fmt.Println(methods)
	s.methods = methods
}

func CreateService(app *interfaces.IApp, key string) Service {
	return Service{app: app, key: key, methods: map[string]interfaces.IMethod{}}
}
