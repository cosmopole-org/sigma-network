package modules

import (
	"context"
	"sigma/admin/core/utils"

	"github.com/redis/go-redis/v9"
	"github.com/sirupsen/logrus"
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
		utils.Log(logrus.DebugLevel, err)
	}
}

func (m *Memory) Get(key string) string {
	val, err := m.Storage.Get(context.Background(), key).Result()
	if err == redis.Nil {
		utils.Log(logrus.DebugLevel, "key: "+key+" does not exist")
		return ""
	} else if err != nil {
		utils.Log(logrus.DebugLevel, err)
		return ""
	}
	return val
}

func (m *Memory) Del(key string) {
	err := m.Storage.Del(context.Background(), key).Err()
	if err != nil {
		utils.Log(logrus.DebugLevel, err)
	}
}

func CreateMemory(redisUri string) *Memory {
	memory := &Memory{}
	utils.Log(logrus.DebugLevel, "connecting to redis...")
	memory.CreateClient(redisUri)
	return memory
}
