package modules

import (
	"context"
	"encoding/json"
	"fmt"
	"sigma/main/core/utils"

	"github.com/mitchellh/mapstructure"
	"github.com/redis/go-redis/v9"
)

type InterfedPacket struct {
	Key        string
	UserId     int64
	TowerId    int64
	RoomId     int64
	RequestId  string
	Data       string
	IsResponse bool
}

type Memory struct {
	Storage      *redis.Client
	FedHandler   func(app *App, channelId string, payload InterfedPacket)
	IFResChannel chan [2][]byte
}

func (m *Memory) GetClient() *redis.Client {
	return m.Storage
}

const channelPrefix = "inbox."

func (m *Memory) CreateClient(redisUri string) {
	opts, err := redis.ParseURL(redisUri)
	if err != nil {
		panic(err)
	}
	db := redis.NewClient(opts)
	m.Storage = db
	m.FedHandler = func(app *App, channelId string, payload InterfedPacket) {
		if payload.IsResponse {
			app.Network.PusherServer.PushToUser(payload.UserId, payload.Data, true)
		} else {
			var input any
			err2 := json.Unmarshal([]byte(payload.Data), &input)
			if err2 != nil {
				fmt.Println(err2)
				return
			}
			fn := Handlers[payload.Key]
			f := Frames[payload.Key]
			mapstructure.Decode(input, &f)
			result, err := fn(app, f, Assistant{
				UserId: payload.UserId,
				UserType: "human",
				TowerId: payload.TowerId,
				RoomId: payload.RoomId,
				WorkerId: 0,
				UserOrigin: channelId,
			})
			if err != nil {
				fmt.Println(err)
				errPack, err2 := json.Marshal(utils.BuildErrorJson(err.Error()))
				if err2 == nil {
					m.SendInFederation(channelId, InterfedPacket{IsResponse: true, RequestId: payload.RequestId, Data: string(errPack), UserId: payload.UserId})
				}
				return
			}
			packet, err3 := json.Marshal(result)
			if err3 != nil {
				fmt.Println(err3)
				errPack, err2 := json.Marshal(utils.BuildErrorJson(err3.Error()))
				if err2 == nil {
					m.SendInFederation(channelId, InterfedPacket{IsResponse: true, RequestId: payload.RequestId, Data: string(errPack), UserId: payload.UserId})
				}
				return
			}
			m.SendInFederation(channelId, InterfedPacket{IsResponse: true, RequestId: payload.RequestId, Data: string(packet), UserId: payload.UserId})
		}
	}
	ctx := context.Background()
	pubsub := db.PSubscribe(ctx, channelPrefix+app.AppId+"."+"*")
	go func() {
		for {
			msg, err := pubsub.ReceiveMessage(ctx)
			if err != nil {
				panic(err)
			}
			var interfedPacket InterfedPacket
			err2 := json.Unmarshal([]byte(msg.Payload), &interfedPacket)
			if err2 != nil {
				fmt.Println(err2)
				continue
			}
			m.FedHandler(Instance(), msg.Channel[len(channelPrefix+app.AppId+"."):], interfedPacket)
		}
	}()
}

func (m *Memory) SendInFederation(destOrg string, packet InterfedPacket) {
	var output, err = json.Marshal(packet)
	if err != nil {
		fmt.Println(err)
		return
	}
	m.Storage.Publish(context.Background(), channelPrefix+destOrg+"."+app.AppId, output)
}

func (m *Memory) Put(key string, value string) {
	err := m.Storage.Set(context.Background(), key, value, 0).Err()
	if err != nil {
		fmt.Println(err)
	}
}

func (m *Memory) Get(key string) string {
	val, err := m.Storage.Get(context.Background(), key).Result()
	if err == redis.Nil {
		fmt.Println("key: " + key + " does not exist")
		return ""
	} else if err != nil {
		fmt.Println(err)
		return ""
	}
	return val
}

func (m *Memory) Del(key string) {
	err := m.Storage.Del(context.Background(), key).Err()
	if err != nil {
		fmt.Println(err)
	}
}

func CreateMemory(redisUri string) *Memory {
	memory := &Memory{}
	fmt.Println("connecting to redis...")
	memory.CreateClient(redisUri)
	return memory
}
