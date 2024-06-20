package memory_manager

import (
	"context"
	"sigma/storage/core/utils"

	"github.com/redis/go-redis/v9"
)

type MemoryManager struct {
	Storage *redis.Client
}

func (m *MemoryManager) GetClient() *redis.Client {
	return m.Storage
}

func (m *MemoryManager) CreateClient(redisUri string) {
	opts, err := redis.ParseURL(redisUri)
	if err != nil {
		panic(err)
	}
	db := redis.NewClient(opts)
	m.Storage = db
}

func (m *MemoryManager) Put(key string, value string) {
	err := m.Storage.Set(context.Background(), key, value, 0).Err()
	if err != nil {
		utils.Log(5, err)
	}
}

func (m *MemoryManager) Get(key string) string {
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

func (m *MemoryManager) Del(key string) {
	err := m.Storage.Del(context.Background(), key).Err()
	if err != nil {
		utils.Log(5, err)
	}
}

func CreateMemory(redisUri string) *MemoryManager {
	memory := &MemoryManager{}
	utils.Log(5, "connecting to redis...")
	memory.CreateClient(redisUri)
	return memory
}
