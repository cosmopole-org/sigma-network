package modules

import (
	"github.com/jackc/pgx/v4/pgxpool"
	"github.com/redis/go-redis/v9"
)

type Database struct {
	Db *pgxpool.Pool
}

type Memory struct {
	Storage    *redis.Client
	FedHandler func(channelId string, payload string)
}

type MethodOptions struct {
	AsEndpoint bool
	AsGrpc     bool
}

type Check struct {
	User  bool
	Tower bool
	Room  bool
}

type IPacket interface {
	GetData() any
}

type Method struct {
	Key           string
	Callback      func(app *App, dto interface{}, assistant Assistant) (any, error)
	Check         *Check
	InTemplate    any
	MethodOptions *MethodOptions
}

type WebsocketAnswer struct {
	Status    int
	RequestId string
	Data      any
}

type ListenOptions struct {
	Https     bool
	HttpsPort int
	Grpc      bool
	GrpcPort  int
}

type Meta struct {
	UserId  int64
	TowerId int64
	RoomId  int64
}

type IDto interface {
	GetData() any
}
