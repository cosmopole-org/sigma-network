package modules

import (
	"context"
	"sigma/main/core/utils"

	"github.com/redis/go-redis/v9"
)

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

func (m *Memory) Put(key string, value string) {
	err := m.Storage.Set(context.Background(), key, value, 0).Err()
	if err != nil {
		utils.Log(5, err)
	}
}

func (m *Memory) Get(key string) string {
	val, err := m.Storage.Get(context.Background(), key).Result()
	if err == redis.Nil {
		utils.Log(5, "key: "+key+" does not exist")
		return ""
	} else if err != nil {
		utils.Log(5, err)
		return ""
	}
	return val
}

func (m *Memory) Del(key string) {
	err := m.Storage.Del(context.Background(), key).Err()
	if err != nil {
		utils.Log(5, err)
	}
}

func CreateMemory(redisUri string) *Memory {
	memory := &Memory{}
	utils.Log(5, "connecting to redis...")
	memory.CreateClient(redisUri)
	return memory
}
