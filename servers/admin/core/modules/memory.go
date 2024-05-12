package modules

import (
	"context"
	"log"

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
	GroupId    int64
	Exceptions []GroupMember
}

type Memory struct {
	Storage *redis.Client
}

func (m *Memory) GetClient() *redis.Client {
	return m.Storage
}

func (m *Memory) CreateClient(redisUri string) {
	opts, err := redis.ParseURL(redisUri)
	if err != nil {
		panic(err)
	}
	db := redis.NewClient(opts)
	m.Storage = db
}

func (m *Memory) SendInFederation(destOrg string, packet InterfedPacket) {
	// pass
}

func (m *Memory) Put(key string, value string) {
	err := m.Storage.Set(context.Background(), key, value, 0).Err()
	if err != nil {
		log.Println(err)
	}
}

func (m *Memory) Get(key string) string {
	val, err := m.Storage.Get(context.Background(), key).Result()
	if err == redis.Nil {
		log.Println("key: " + key + " does not exist")
		return ""
	} else if err != nil {
		log.Println(err)
		return ""
	}
	return val
}

func (m *Memory) Del(key string) {
	err := m.Storage.Del(context.Background(), key).Err()
	if err != nil {
		log.Println(err)
	}
}

func CreateMemory(redisUri string) *Memory {
	memory := &Memory{}
	log.Println("connecting to redis...")
	memory.CreateClient(redisUri)
	return memory
}
