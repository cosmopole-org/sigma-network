package tools

import (
	"sigma/main/core/adapters"
	shell_federation "sigma/main/shell/network/federation"
	file_manager "sigma/main/shell/tools/files"
	network_manager "sigma/main/shell/tools/network"
	plugins_tool "sigma/main/shell/tools/plugin"
)

type Toolbox struct {
	*layer1_app.App
	adapters.ICoreAdapters
	net  *network_manager.NetManager
	wasm *plugins_tool.PluginsTool
	file *file_manager.FileManager
}

func (s *Toolbox) File() *file_manager.FileManager {
	return s.file
}

func (s *Toolbox) Net() *network_manager.NetManager {
	return s.net
}

func (s *Toolbox) Plugins() *plugins_tool.PluginsTool {
	return s.wasm
}

func New(sc *layer1_app.App, maxReqSize int, ip2host map[string]string, host2ip map[string]string, fed *shell_federation.FedNet) *Toolbox {
	mans := Toolbox{
		ICoreAdapters: sc.Adapters(),
		App:           sc,
		net:           network_manager.New(sc, maxReqSize, ip2host, host2ip, fed),
		file:          file_manager.New(sc),
	}
	mans.wasm = plugins_tool.New(sc, mans.net)
	return &mans
}
