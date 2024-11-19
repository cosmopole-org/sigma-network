package module_model

import (
	"sigma/sigma/abstract"
	modulelogger "sigma/sigma/core/module/logger"
	"sigma/sigma/layer1/adapters"
	toolbox2 "sigma/sigma/layer1/module/toolbox"
	tool_chain "sigma/sigma/layer2/tools/chain"
	toolfile "sigma/sigma/layer2/tools/file"
	// "sigma/sigma/layer2/tools/wasm"
)

type ToolboxL2 struct {
	*toolbox2.ToolboxL1
	storage adapters.IStorage
	cache   adapters.ICache
	// wasm    *wasm.Wasm
	file    *toolfile.File
	chain   *tool_chain.Chain
}

func (s *ToolboxL2) Storage() adapters.IStorage {
	return s.storage
}

func (s *ToolboxL2) Cache() adapters.ICache {
	return s.cache
}

// func (s *ToolboxL2) Wasm() *wasm.Wasm {
// 	return s.wasm
// }

func (s *ToolboxL2) File() *toolfile.File {
	return s.file
}

func (s *ToolboxL2) Chain() *tool_chain.Chain {
	return s.chain
}

func (s *ToolboxL2) Dummy() {
	// pass
}

func NewTools(core abstract.ICore, logger *modulelogger.Logger, storageRoot string, storage adapters.IStorage, cache adapters.ICache, file *toolfile.File, chain *tool_chain.Chain) *ToolboxL2 {
	return &ToolboxL2{storage: storage, cache: cache, /*wasm: wasm.NewWasm(core, logger, storageRoot, storage),*/ file: file, chain: chain}
}
