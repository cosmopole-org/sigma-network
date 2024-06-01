package tools

import (
	"sigma/main/core/runtime"
	coreTools "sigma/main/core/tools"
	"sigma/main/core/tools/storage"
	shell_federation "sigma/main/shell/network/federation"
	file_manager "sigma/main/shell/tools/files"
	network_manager "sigma/main/shell/tools/network"
	wasm_manager "sigma/main/shell/tools/wasm"
)

type IShellTools interface {
	coreTools.ICoreTools
	File() *file_manager.FileManager
	Net() *network_manager.NetManager
	Wasm() *wasm_manager.WasmManager
}

type Tools struct {
	coreTools.ICoreTools
	Federative  bool
	netManager  *network_manager.NetManager
	wasmManager *wasm_manager.WasmManager
	fileManager *file_manager.FileManager
}

func (s *Tools) File() *file_manager.FileManager {
	return s.fileManager
}

func (s *Tools) Net() *network_manager.NetManager {
	return s.netManager
}

func (s *Tools) Wasm() *wasm_manager.WasmManager {
	return s.wasmManager
}

func New(sc *runtime.App, storage storage.IStorage, maxReqSize int, ip2host map[string]string, host2ip map[string]string, fed *shell_federation.FedNet) IShellTools {
	mans := Tools{
		ICoreTools:     sc.Tools,
		netManager:     network_manager.New(sc, maxReqSize, ip2host, host2ip, fed),
		fileManager:    file_manager.New(sc),
	}
	mans.wasmManager = wasm_manager.New(sc, mans.netManager)
	return &mans
}
