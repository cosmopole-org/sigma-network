package interfaces

import (
	"mime/multipart"
	"sigma/admin/core/models"

	"github.com/jackc/pgx/v4/pgxpool"
	"github.com/redis/go-redis/v9"
	"google.golang.org/grpc"
)

type Meta struct {
	UserId  int64
	TowerId int64
	RoomId  int64
}

type IPusher interface {
	PushToUser(userId int64, data any)
	PushToGroup(groupId int64, data any, exceptions []int64)
	JoinGroup(groupId int64, userId int64)
	LeaveGroup(groupId int64, userId int64)
}

type IApp interface {
	AddService(s IService)
	GetService(key string) IService
	GetSecurity() ISecurity
	GetDatabase() IDatabase
	GetMemory() IMemory
	GetNetwork() INetwork
	SetSecurity(security ISecurity)
	SetDatabase(database IDatabase)
	SetMemory(memory IMemory)
	SetNetwork(network INetwork)
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
	AddGrpcLoader(fn func())
	AddMethod(method IMethod)
	GetMethod(key string) IMethod
	CallMethod(key string, dto interface{}, meta Meta) (any, error)
	SetKey(key string)
	SetMethods(methods map[string]IMethod)
}

type IMethod interface {
	GetKey() string
	SetKey(key string)
	SetCallback(callback func(app IApp, input interface{}, assistant IAssistant) (any, error))
	GetCallback() func(app IApp, input interface{}, assistant IAssistant) (any, error)
	GetCheck() ICheck
	GetInTemplate() any
	MethodOptions() IMethodOptions
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
	GetClient() *redis.Client
	Put(key string, value string)
	Get(key string) string
	Del(key string)
}

type INetwork interface {
	GetGrpcServer() *grpc.Server
	GetPusherServer() IPusher
	Listen(options IListenOptions)
}

type ISecurity interface {
	SetGodEmails(gods []models.Admin)
	IsGodEmail(email string) bool
	GetGodByEmail(email string) *models.Admin
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

type IMethodOptions interface {
	AsEndpoint() bool
	AsGrpc() bool
}

type IListenOptions interface {
	Grpc() bool
	Https() bool
	HttpsPort() int
	GrpcPort() int
}
