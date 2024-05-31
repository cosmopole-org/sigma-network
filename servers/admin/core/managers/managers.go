package managers

import (
	"sigma/admin/core/managers/crypto"
	"sigma/admin/core/managers/memory"
	"sigma/admin/core/managers/pusher"
	"sigma/admin/core/managers/security"
	"sigma/admin/core/managers/storage"
	"sigma/admin/core/models"
)

type ICoreManagers interface {
	StorageManager() storage.IGlobStorage
	MemoryManager() memory.IMemory
	PushManager() *pusher.Pusher
	CryptoManager() *crypto.Crypto
	SecurityManager() *security.SecurityManager
}

type Managers struct {
	stoManager  storage.IGlobStorage
	memManager  memory.IMemory
	pushManager *pusher.Pusher
	crypManager *crypto.Crypto
	secManager  *security.SecurityManager
}

func (s *Managers) StorageManager() storage.IGlobStorage {
	return s.stoManager
}

func (s *Managers) MemoryManager() memory.IMemory {
	return s.memManager
}

func (s *Managers) PushManager() *pusher.Pusher {
	return s.pushManager
}

func (s *Managers) CryptoManager() *crypto.Crypto {
	return s.crypManager
}

func (s *Managers) SecurityManager() *security.SecurityManager {
	return s.secManager
}

func New(appId string, storageRoot string, stoManager storage.IGlobStorage, memManager memory.IMemory, pusherConnector func(s string, op models.OriginPacket)) ICoreManagers {
	mans := &Managers{
		crypManager: crypto.CreateCrypto(storageRoot),
		pushManager: pusher.CreatePusher(appId, pusherConnector),
		stoManager: stoManager,
		memManager: memManager,
	}
	mans.secManager = security.New(mans.stoManager, mans.memManager, mans.crypManager, mans.pushManager)
	return mans
}
