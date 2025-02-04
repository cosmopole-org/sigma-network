package tool_cache

import (
	"context"
	"errors"
	"github.com/redis/go-redis/v9"
	modulelogger "sigma/sigma/core/module/logger"
)

type Cache struct {
	logger      *modulelogger.Logger
	RedisClient *redis.Client
}

func NewCache(logger *modulelogger.Logger, redisUri string) *Cache {
	logger.Println("connecting to cache...")
	opts, err := redis.ParseURL(redisUri)
	if err != nil {
		panic(err)
	}
	client := redis.NewClient(opts)
	return &Cache{RedisClient: client, logger: logger}
}

func (m *Cache) Infra() any {
	return m.RedisClient
}

func (m *Cache) Put(key string, value string) {
	err := m.RedisClient.Set(context.Background(), key, value, 0).Err()
	if err != nil {
		m.logger.Println(err)
	}
}

func (m *Cache) Get(key string) string {
	val, err := m.RedisClient.Get(context.Background(), key).Result()
	if errors.Is(err, redis.Nil) {
		return ""
	} else if err != nil {
		return ""
	}
	return val
}

func (m *Cache) Del(key string) {
	err := m.RedisClient.Del(context.Background(), key).Err()
	if err != nil {
		m.logger.Println(err)
	}
}
