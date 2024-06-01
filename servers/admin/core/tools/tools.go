package tools

import (
	"sigma/admin/core/tools/cache"
	"sigma/admin/core/tools/crypto"
	"sigma/admin/core/tools/federation"
	"sigma/admin/core/tools/security"
	"sigma/admin/core/tools/signaler"
	"sigma/admin/core/tools/storage"
)

type ICoreTools interface {
	Federation() federation.IFederation
	Storage() storage.IStorage
	Cache() cache.ICache
	Signaler() *signaler.Signaler
	Crypto() *crypto.Crypto
	Security() *security.Security
}

type Tools struct {
	fedManager     federation.IFederation
	storageManager storage.IStorage
	cacheManager   cache.ICache
	signalManager  *signaler.Signaler
	crypManager    *crypto.Crypto
	secManager     *security.Security
}

func (s *Tools) Federation() federation.IFederation {
	return s.fedManager
}

func (s *Tools) Storage() storage.IStorage {
	return s.storageManager
}

func (s *Tools) Cache() cache.ICache {
	return s.cacheManager
}

func (s *Tools) Signaler() *signaler.Signaler {
	return s.signalManager
}

func (s *Tools) Crypto() *crypto.Crypto {
	return s.crypManager
}

func (s *Tools) Security() *security.Security {
	return s.secManager
}

func New(appId string, storageRoot string, storageManager storage.IStorage, cacheManager cache.ICache, fedManager federation.IFederation) ICoreTools {
	mans := &Tools{
		crypManager:    crypto.CreateCrypto(storageRoot),
		signalManager:  signaler.CreateSignaler(appId, fedManager),
		storageManager: storageManager,
		cacheManager:   cacheManager,
		fedManager:     fedManager,
	}
	mans.secManager = security.New(mans.storageManager, mans.cacheManager, mans.crypManager, mans.signalManager)
	return mans
}
