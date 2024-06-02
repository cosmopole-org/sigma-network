package tools

import (
	"sigma/main/core/adapters"
	"sigma/main/core/runtime"
	shell_federation "sigma/main/shell/network/federation"
	file_manager "sigma/main/shell/tools/files"
	network_manager "sigma/main/shell/tools/network"
	wasm_manager "sigma/main/shell/tools/wasm"
)

type Toolbox struct {
	*runtime.App
	adapters.ICoreAdapters
	net    *network_manager.NetManager
	wasm   *wasm_manager.WasmManager
	file   *file_manager.FileManager
}

func (s *Toolbox) File() *file_manager.FileManager {
	return s.file
}

func (s *Toolbox) Net() *network_manager.NetManager {
	return s.net
}

func (s *Toolbox) Wasm() *wasm_manager.WasmManager {
	return s.wasm
}

func New(sc *runtime.App, maxReqSize int, ip2host map[string]string, host2ip map[string]string, fed *shell_federation.FedNet) *Toolbox {
	mans := Toolbox{
		ICoreAdapters: sc.Adapters(),
		App:           sc,
		net:           network_manager.New(sc, maxReqSize, ip2host, host2ip, fed),
		file:          file_manager.New(sc),
	}
	mans.wasm = wasm_manager.New(sc, mans.net)
	return &mans
}
