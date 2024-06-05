package module_model

import (
	"sigma/sigma/layer1/adapters"
)

type ToolboxL1 struct {
	storage    adapters.IStorage
	cache      adapters.ICache
	federation adapters.IFederation
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

func (s *ToolboxL1) Dummy() {
	// pass
}

func NewTools(storage adapters.IStorage, cache adapters.ICache, federation adapters.IFederation) *ToolboxL1 {
	return &ToolboxL1{storage: storage, cache: cache, federation: federation}
}
