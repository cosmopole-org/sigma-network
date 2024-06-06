package module_model

import (
	"sigma/sigma/abstract"
	module_logger "sigma/sigma/core/module/logger"
	"sigma/sigma/layer1/adapters"
	"sigma/sigma/layer2/tools/wasm"
)

type ToolboxL2 struct {
	storage adapters.IStorage
	cache   adapters.ICache
	wasm    *wasm.Wasm
}

func (s *ToolboxL2) Storage() adapters.IStorage {
	return s.storage
}

func (s *ToolboxL2) Cache() adapters.ICache {
	return s.cache
}

func (s *ToolboxL2) Wasm() *wasm.Wasm {
	return s.wasm
}

func (s *ToolboxL2) Dummy() {
	// pass
}

func NewTools(core abstract.ICore, logger *module_logger.Logger, storageRoot string, storage adapters.IStorage, cache adapters.ICache) *ToolboxL2 {
	return &ToolboxL2{storage: storage, cache: cache, wasm: wasm.NewWasm(core, logger, storageRoot)}
}
