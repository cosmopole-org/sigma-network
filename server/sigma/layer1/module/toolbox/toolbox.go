package toolbox

import (
	module_logger "sigma/sigma/core/module/logger"
	"sigma/sigma/layer1/adapters"
	"sigma/sigma/layer1/tools/security"
	"sigma/sigma/layer1/tools/signaler"
)

type IToolboxL1 interface {
	Storage() adapters.IStorage
	Cache() adapters.ICache
	Federation() adapters.IFederation
	Security() *security.Security
	Signaler() *signaler.Signaler
}

type ToolboxL1 struct {
	storage    adapters.IStorage
	cache      adapters.ICache
	federation adapters.IFederation
	security   *security.Security
	signaler   *signaler.Signaler
}

func (s *ToolboxL1) Storage() adapters.IStorage {
	return s.storage
}

func (s *ToolboxL1) Cache() adapters.ICache {
	return s.cache
}

func (s *ToolboxL1) Federation() adapters.IFederation {
	return s.federation
}

func (s *ToolboxL1) Security() *security.Security {
	return s.security
}

func (s *ToolboxL1) Signaler() *signaler.Signaler {
	return s.signaler
}

func (s *ToolboxL1) Dummy() {
	// pass
}

func NewTools(appId string, logger *module_logger.Logger, storage adapters.IStorage, cache adapters.ICache, federation adapters.IFederation) *ToolboxL1 {
	sig := signaler.NewSignaler(appId, logger, federation)
	sec := security.New(storage.StorageRoot(), storage, cache, sig)
	return &ToolboxL1{storage: storage, cache: cache, federation: federation, signaler: sig, security: sec}
}
