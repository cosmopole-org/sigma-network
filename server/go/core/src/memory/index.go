package memory

import (
	"context"
	"fmt"

	"github.com/redis/go-redis/v9"
)

type Memory struct {
	Storage *redis.Client
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