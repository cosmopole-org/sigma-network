package managers

import (
	"sigma/admin/core/managers/crypto"
	"sigma/admin/core/managers/database"
	"sigma/admin/core/managers/memory"
	"sigma/admin/core/managers/pusher"
	"sigma/admin/core/managers/security"
	"sigma/admin/core/models"

	"gorm.io/gorm"
)

type Managers struct {
	dbManager   *database.Database
	memManager  *memory.Memory
	pushManager *pusher.Pusher
	crypManager *crypto.Crypto
	secManager  *security.SecurityManager
}

func (s *Managers) DatabaseManager() *database.Database {
	return s.dbManager
}

func (s *Managers) MemoryManager() *memory.Memory {
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

func New(appId string, dialector gorm.Dialector, memUri string, storageRoot string, pusherConnector func(s string, op models.OriginPacket)) *Managers {
	mans := &Managers{
		dbManager:   database.CreateDatabase(dialector),
		memManager:  memory.CreateMemory(memUri),
		crypManager: crypto.CreateCrypto(storageRoot),
		pushManager: pusher.CreatePusher(appId, pusherConnector),
	}
	mans.secManager = security.New(mans.memManager)
	return mans
}
