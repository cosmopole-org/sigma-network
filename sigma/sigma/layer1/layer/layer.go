package layer

import (
	"sigma/sigma/abstract"
	moduleactor "sigma/sigma/core/module/actor"
	module_logger "sigma/sigma/core/module/logger"
	"sigma/sigma/layer1/adapters"
	modulestate "sigma/sigma/layer1/module/state"
	"sigma/sigma/layer1/module/toolbox"
)

type Layer struct {
	actor        abstract.IActor
	toolbox      abstract.IToolbox
	stateBuilder abstract.IStateBuilder
}

func New() abstract.ILayer {
	return &Layer{actor: moduleactor.NewActor()}
}

func (l *Layer) BackFill(core abstract.ICore, args ...interface{}) []interface{} {
	l.toolbox = toolbox.NewTools(core.Id(), args[0].(*module_logger.Logger), args[1].(adapters.IStorage), args[2].(adapters.ICache), args[3].(adapters.IFederation))
	return []interface{}{}
}

func (l *Layer) ForFill(core abstract.ICore, args ...interface{}) {
	// pass
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
	l.stateBuilder = modulestate.NewStateBuilder(l, bottom)
	return l.stateBuilder
}
