package types

import (
	"fmt"
	"sigma/core/src/interfaces"
)

type Controller struct {
	key     string
	service interfaces.IService
	endpoints map[string]interfaces.IEndpoint
}

func (c Controller) GetKey() string {
	return c.key
}

func (c Controller) GetService() interfaces.IService {
	return c.service
}

func (c Controller) CallEndpoint(app *interfaces.IApp, key string, packet interfaces.IPacket, dto interfaces.IDto, guard interfaces.IGuard) (any, error) {
	return c.GetService().GetMethod(key).GetCallback()(app, dto, guard)
}

func (c Controller) AddEndpoint(endpoint interfaces.IEndpoint) interfaces.IController {
	fmt.Println(c.endpoints, endpoint.GetKey())
	c.endpoints[endpoint.GetKey()] = endpoint
	return c
}

func (c Controller) GetEndpoint(key string) interfaces.IEndpoint {
	//fmt.Println(key, c.endpoints)
	return c.endpoints[key]
}

func CreateController(key string, service interfaces.IService) interfaces.IController {
	return Controller{key: key, service: service, endpoints: map[string]interfaces.IEndpoint{}}
}
