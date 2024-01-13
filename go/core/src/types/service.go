package types

import (
	"fmt"
	"sigma/core/src/interfaces"
)

type Service struct {
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

func (s Service) CallMethod(app *interfaces.IApp, key string, args []any) {
    var method = s.GetMethod(key)
	packet := CreateLogicPacket(args)
	method.GetCallback()(app, packet, nil)
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

func CreateService(key string) Service {
	return Service{key: key, methods: map[string]interfaces.IMethod{}}
}
