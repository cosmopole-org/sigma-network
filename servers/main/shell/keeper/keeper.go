package shell_keeper

import network_manager "sigma/main/shell/network/manager"

var Instance *network_manager.NetManager

func Keep(nm *network_manager.NetManager) {
	Instance = nm
}
