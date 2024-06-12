package module_model

import (
	modulemodel "sigma/sigma/layer2/model"
	toolnet "sigma/sigma/layer3/tools/network"
)

type ToolboxL3 struct {
	*modulemodel.ToolboxL2
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
