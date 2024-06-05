package io_cache

import (
	"context"
	"errors"
	"github.com/redis/go-redis/v9"
)

type Cache struct {
	log         func(...interface{})
	RedisClient *redis.Client
}

func NewCache(redisUri string) *Cache {
	opts, err := redis.ParseURL(redisUri)
	if err != nil {
		panic(err)
	}
	client := redis.NewClient(opts)
	return &Cache{RedisClient: client}
}

func (m *Cache) Put(key string, value string) {
	err := m.RedisClient.Set(context.Background(), key, value, 0).Err()
	if err != nil {
		m.log(err)
	}
}

func (m *Cache) Get(key string) string {
	val, err := m.RedisClient.Get(context.Background(), key).Result()
	if errors.Is(err, redis.Nil) {
		m.log(err)
		return ""
	} else if err != nil {
		m.log(err)
		return ""
	}
	return val
}

func (m *Cache) Del(key string) {
	err := m.RedisClient.Del(context.Background(), key).Err()
	if err != nil {
		m.log(err)
	}
}
