package interfaces

import (
	"github.com/jackc/pgx/v4/pgxpool"
)

type IApp interface {
	AddService(s IService)
	GetService(key string) IService
	Listen(restPort int, socketPort int)
	GetDatabase() IDatabase
	GetNetwork() INetwork
	LoadServices()
}

type IController interface {
	GetKey() string
	GetService() IService
	CallEndpoint(app *IApp, key string, packet IPacket, dto IDto, guard IGuard) (any, error)
	GetEndpoint(key string) IEndpoint
	AddEndpoint(endpoint IEndpoint) IController
}

type IService interface {
	GetKey() string
	AddMethod(method IMethod) IService
	GetMethod(key string) IMethod
	CallMethod(app *IApp, key string, dto IDto, guard IGuard) (any, error)
	SetKey(key string)
	SetMethods(methods map[string]IMethod)
}

type IMethod interface {
	GetKey() string
	SetKey(key string)
	SetCallback(callback func(app *IApp, input IDto, guard IGuard) (any, error))
	GetCallback() func(app *IApp, input IDto, guard IGuard) (any, error)
	GetCheck() ICheck
	GetInTemplate() IDto
	AsEndpoint() bool
}

type IEndpoint interface {
	GetKey() string
	GetCallback() func(app *IApp, packet IPacket, input IDto, guard IGuard)
	GetServiceKey() string
	GetMethodKey() string
}

type IPacket interface {
	GetData() any
}

type IDatabase interface {
	GetDb() *pgxpool.Pool
}

type INetwork interface {
	Listen(restPort int, socketPort int)
}

type IDto interface {
	GetData() any
}

type IGuard interface {
	GetUserId() int64
	GetTowerId() int64
	GetRoomId() int64
}

type ICheck interface {
	NeedUser() bool
	NeedTower() bool
	NeedRoom() bool
}
