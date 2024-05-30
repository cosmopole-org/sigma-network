package security_manager

import (
	"sigma/storage/core/models"
	"sigma/storage/core/runtime"
	base_manager "sigma/storage/shell/managers/base"
)

type SecurityManager struct {
	base_manager.BaseManager
}

func (sm *SecurityManager) LoadKeys() {
	if sm.App.Managers.CryptoManager().FetchKeyPair("server_key") == nil {
		sm.App.Managers.CryptoManager().GenerateSecureKeyPair("server_key")
	}
}

func (sm *SecurityManager) LoadAccess() {
	var members []models.Member
	sm.App.Managers.DatabaseManager().Db.Find(&members)
	for _, member := range members {
		sm.App.Managers.PushManager().JoinGroup(member.SpaceId, member.UserId)
	}
}

func New(sc *runtime.App) *SecurityManager {
	sm := &SecurityManager{}
	sm.App = sc
	sm.LoadKeys()
	sm.LoadAccess()
	return sm
}
