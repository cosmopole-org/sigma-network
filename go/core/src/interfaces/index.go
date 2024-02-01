package interfaces

import (
	"mime/multipart"

	"github.com/jackc/pgx/v4/pgxpool"
)

type IApp interface {
	AddService(s IService)
	GetService(key string) IService
	Listen(restPort int, socketPort int)
	GetDatabase() IDatabase
	GetMemory() IMemory
	GetNetwork() INetwork
	GetStorageRoot() string
	LoadServices()
}

type IController interface {
	GetKey() string
	GetService() IService
	CallEndpoint(app *IApp, key string, packet IPacket, dto IDto, assistant IAssistant) (any, error)
	GetEndpoint(key string) IEndpoint
	AddEndpoint(endpoint IEndpoint) IController
}

type IService interface {
	GetKey() string
	AddMethod(method IMethod) IService
	GetMethod(key string) IMethod
	CallMethod(app *IApp, key string, dto IDto, assistant IAssistant) (any, error)
	SetKey(key string)
	SetMethods(methods map[string]IMethod)
}

type IMethod interface {
	GetKey() string
	SetKey(key string)
	SetCallback(callback func(app *IApp, input IDto, assistant IAssistant) (any, error))
	GetCallback() func(app *IApp, input IDto, assistant IAssistant) (any, error)
	GetCheck() ICheck
	GetInTemplate() IDto
	AsEndpoint() bool
	AsRaw() bool
}

type IEndpoint interface {
	GetKey() string
	GetCallback() func(app *IApp, packet IPacket, input IDto, assistant IAssistant)
	GetServiceKey() string
	GetMethodKey() string
}

type IPacket interface {
	GetData() any
}

type IDatabase interface {
	GetDb() *pgxpool.Pool
}

type IMemory interface {
	Put(key string, value string)
	Get(key string) string
	Del(key string)
}

type INetwork interface {
	Listen(restPort int, socketPort int)
	PushToUser(userId int64, data any)
	PushToGroup(groupId int64, data any, exceptions []int64)
	JoinGroup(groupId int64, userId int64)
	LeaveGroup(groupId int64, userId int64)
}

type IDto interface {
	GetData() any
}

type IAssistant interface {
	GetUserId() int64
	GetWorkerId() int64
	GetUserType() string
	GetTowerId() int64
	GetRoomId() int64
	GetWebPacket() IPacket
	SaveFileToStorage(storageRoot string, fh *multipart.FileHeader, key string) error
}

type ICheck interface {
	NeedUser() bool
	NeedTower() bool
	NeedRoom() bool
}
