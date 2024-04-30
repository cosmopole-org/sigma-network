package types

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/redis/go-redis/v9"
)

type InterfedPacket struct {
	Key       string
	UserId    int64
	TowerId   int64
	RoomId    int64
	RequestId string
	Data      string
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
	ctx := context.Background()
	pubsub := db.PSubscribe(ctx, channelPrefix+"*")
	go func() {
		for {
			res := <- m.IFResChannel
			db.Publish(ctx, string(res[0]), res[1])
		}
	}()
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
			m.FedHandler(Instance(), msg.Channel[len(channelPrefix):], interfedPacket)
		}
	}()
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
