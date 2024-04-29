package types

import (
	"github.com/jackc/pgx/v4/pgxpool"
	"github.com/redis/go-redis/v9"
	"github.com/valyala/fasthttp"
	"google.golang.org/grpc"
)

type App struct {
	appId       string
	services    map[string]Service
	network     *Network
	database    *Database
	memory      *Memory
	storageRoot string
}

type Database struct {
	db *pgxpool.Pool
}

type Memory struct {
	Storage    *redis.Client
	fedHandler func(channelId string, payload string)
}

type Network struct {
	grpcServer   *grpc.Server
	pusherServer Pusher
}

type Pusher struct{}

type Service struct {
	app     *App
	key     string
	methods map[string]*Method
}

type MethodOptions struct {
	asEndpoint bool
	asGrpc     bool
}

type Check struct {
	user  bool
	tower bool
	room  bool
}

type Assistant struct {
	userId   int64
	userType string
	workerId int64
	towerId  int64
	roomId   int64
	packet   *Packet
}

type Method struct {
	key           string
	callback      func(app *App, dto interface{}, assistant *Assistant) (any, error)
	check         *Check
	inTemplate    any
	methodOptions *MethodOptions
}

type WebPacket struct {
	uri         string
	body        []byte
	headers     map[string]string
	httpContext *fasthttp.RequestCtx
	onAnswer    func(answer []byte)
	requestId   string
}

type WebsocketAnswer struct {
	status    int
	requestId string
	data      any
}

