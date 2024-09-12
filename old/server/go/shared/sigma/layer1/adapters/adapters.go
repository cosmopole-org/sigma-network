package adapters

import (
	"sigma/main/layer1/adapters/cache"
	"sigma/main/layer1/adapters/federation"
	"sigma/main/layer1/adapters/storage"
)

type Adapters struct {
	fedManager     federation.IFederation
	storageManager storage.IStorage
	cacheManager   cache.ICache
}

func (s *Adapters) Federation() federation.IFederation {
	return s.fedManager
}

func (s *Adapters) Storage() storage.IStorage {
	return s.storageManager
}

func (s *Adapters) Cache() cache.ICache {
	return s.cacheManager
}

func New(storageManager storage.IStorage, cacheManager cache.ICache, fedManager federation.IFederation) *Adapters {
	adapters := &Adapters{
		storageManager: storageManager,
		cacheManager:   cacheManager,
		fedManager:     fedManager,
	}
	return adapters
}
