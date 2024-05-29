package security_manager

import (
	"sigma/main/core/models"
	"sigma/main/core/runtime"
	base_manager "sigma/main/shell/managers/base"
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
		sm.App.Managers.PushManager().JoinGroup(member.SpaceId, member.UserId, member.UserOrigin)
	}
	var workers []models.Worker
	sm.App.Managers.DatabaseManager().Db.Find(&workers)
	topicSet := map[int64]int64{}
	topicsArr := []int64{}
	for _, worker := range workers {
		topicsArr = append(topicsArr, worker.TopicId)
	}
	var topics []models.Topic
	sm.App.Managers.DatabaseManager().Db.Table("topic").Where("id in (?)", topicsArr).Find(&topics)
	for _, topic := range topics {
		topicSet[topic.Id] = topic.SpaceId
	}
	for _, worker := range workers {
		sm.App.Managers.PushManager().JoinGroup(topicSet[worker.TopicId], worker.UserId, worker.UserOrigin)
	}
}

func New(sc *runtime.App) *SecurityManager {
	sm := &SecurityManager{}
	sm.App = sc
	sm.LoadKeys()
	sm.LoadAccess()
	return sm
}
