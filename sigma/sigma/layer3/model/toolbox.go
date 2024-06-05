package module_model

import (
	toolnet "sigma/sigma/layer3/tools/network"
)

type ToolboxL3 struct {
	net *toolnet.Network
}

func (s *ToolboxL3) Net() *toolnet.Network {
	return s.net
}

func (s *ToolboxL3) Dummy() {
	// pass
}

func NewTools(net *toolnet.Network) *ToolboxL3 {
	return &ToolboxL3{net: net}
}
