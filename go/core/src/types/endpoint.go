package types

import "sigma/core/src/interfaces"

type Endpoint struct {
	key        string
	serviceKey string
	methodKey  string
	callback   func(app *interfaces.IApp, packet interfaces.IPacket, input interfaces.IDto, guard interfaces.IGuard)
}

func (m Endpoint) GetKey() string {
	return m.key
}

func (m Endpoint) GetServiceKey() string {
	return m.serviceKey
}

func (m Endpoint) GetMethodKey() string {
	return m.methodKey
}

func (m Endpoint) GetCallback() func(app *interfaces.IApp, packet interfaces.IPacket, input interfaces.IDto, guard interfaces.IGuard) {
	return m.callback
}

func CreateEndpoint(key string, serviceKey string, methodKey string, callback func(app *interfaces.IApp, packet interfaces.IPacket, input interfaces.IDto, guard interfaces.IGuard)) Endpoint {
	return Endpoint{key: key, serviceKey: serviceKey, methodKey: methodKey, callback: callback}
}
