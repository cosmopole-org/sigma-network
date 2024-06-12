package layer

import (
	"sigma/sigma/abstract"
	moduleactor "sigma/sigma/core/module/actor"
	modulelogger "sigma/sigma/core/module/logger"
	"sigma/sigma/layer1/module/toolbox"
	module_model "sigma/sigma/layer2/model"
	modulemodel "sigma/sigma/layer3/model"
	tool_net "sigma/sigma/layer3/tools/network"
	netfederation "sigma/sigma/layer3/tools/network/federation"
)

type Layer struct {
	core             abstract.ICore
	actor            abstract.IActor
	toolbox          abstract.IToolbox
	stateBuilder     abstract.IStateBuilder
	logger           *modulelogger.Logger
	wellKnownServers []string
	federation       *netfederation.FedNet
}

func New() abstract.ILayer {
	return &Layer{actor: moduleactor.NewActor()}
}

func (l *Layer) Core() abstract.ICore {
	return l.core
}

func (l *Layer) BackFill(core abstract.ICore, args ...interface{}) []interface{} {
	l.core = core
	l.logger = args[0].(*modulelogger.Logger)
	l.wellKnownServers = args[4].([]string)
	return []interface{}{
		args[0], args[1], args[2], args[3], netfederation.FirstStageBackFill(core, l.wellKnownServers, l.logger),
	}
}

func (l *Layer) ForFill(core abstract.ICore, args ...interface{}) {
	layer1Toolbox := abstract.UseToolbox[*toolbox.ToolboxL1](core.Get(1).Tools())
	net := tool_net.NewNetwork(core, l.logger, layer1Toolbox.Cache(), layer1Toolbox.Signaler())
	net.Fed = l.federation
	tb := modulemodel.NewTools(net)
	tb.ToolboxL2 = abstract.UseToolbox[*module_model.ToolboxL2](args[0])
	l.toolbox = tb
}

func (l *Layer) Index() int {
	return 0
}

func (l *Layer) Actor() abstract.IActor {
	return l.actor
}

func (l *Layer) Tools() abstract.IToolbox {
	return l.toolbox
}

func (l *Layer) Sb() abstract.IStateBuilder {
	return l.stateBuilder
}

func (l *Layer) InitSb(bottom abstract.IStateBuilder) abstract.IStateBuilder {
	l.stateBuilder = modulemodel.NewStateBuilder(l, bottom)
	return l.stateBuilder
}
