package interfaces

import (

	"github.com/jackc/pgx/v4/pgxpool"
)

type IApp interface {
	AddService(s IService)
	GetService(key string) IService
	Listen(port int)
	GetDatabase() IDatabase
	GetNetwork() INetwork
	LoadServices()
}

type IService interface{
	GetKey() string
	AddMethod(method IMethod) IService
	GetMethod(key string) IMethod
	CallMethod(app *IApp, key string, args []any)
	SetKey(key string)
	SetMethods(methods map[string]IMethod)
}

type IMethod interface{
	GetKey() string
	SetKey(key string)
	SetCallback(callback func(app *IApp, input IPacket))
	GetCallback() func(app *IApp, input IPacket)
}

type IPacket interface {
	GetData() any
}

type IDatabase interface {
	Connect(uri string)
	GetDb() *pgxpool.Pool
}

type INetwork interface {
	Listen(port int)
}
