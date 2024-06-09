package adapters

import (
	"sigma/admin/core/adapters/cache"
	"sigma/admin/core/adapters/federation"
	"sigma/admin/core/adapters/storage"
)

type ICoreAdapters interface {
	Federation() federation.IFederation
	Storage() storage.IStorage
	Cache() cache.ICache
}

type CoreAdapters struct {
	fedManager     federation.IFederation
	storageManager storage.IStorage
	cacheManager   cache.ICache
}

func (s *CoreAdapters) Federation() federation.IFederation {
	return s.fedManager
}

func (s *CoreAdapters) Storage() storage.IStorage {
	return s.storageManager
}

func (s *CoreAdapters) Cache() cache.ICache {
	return s.cacheManager
}

func New(storageManager storage.IStorage, cacheManager cache.ICache, fedManager federation.IFederation) ICoreAdapters {
	mans := &CoreAdapters{
		storageManager: storageManager,
		cacheManager:   cacheManager,
		fedManager:     fedManager,
	}
	return mans
}
