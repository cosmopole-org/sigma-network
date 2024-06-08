package layer

import (
	"gorm.io/gorm"
	"sigma/sigma/abstract"
	moduleactor "sigma/sigma/core/module/actor"
	modulelogger "sigma/sigma/core/module/logger"
	modulemodel "sigma/sigma/layer1/module/state"
	module_model "sigma/sigma/layer2/model"
	toolcache "sigma/sigma/layer2/tools/cache"
	toolstorage "sigma/sigma/layer2/tools/storage"
)

type Layer struct {
	core         abstract.ICore
	actor        abstract.IActor
	toolbox      abstract.IToolbox
	stateBuilder abstract.IStateBuilder
}

func New() abstract.ILayer {
	return &Layer{actor: moduleactor.NewActor()}
}

func (l *Layer) Core() abstract.ICore {
	return l.core
}

func (l *Layer) BackFill(core abstract.ICore, args ...interface{}) []interface{} {
	l.core = core
	storage := toolstorage.NewStorage(args[0].(*modulelogger.Logger), args[1].(string), args[2].(gorm.Dialector))
	cache := toolcache.NewCache(args[0].(*modulelogger.Logger), args[3].(string))
	l.toolbox = module_model.NewTools(core, args[0].(*modulelogger.Logger), args[1].(string), storage, cache)
	return []interface{}{
		args[0],
		storage,
		cache,
		args[4],
	}
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
	l.stateBuilder = modulemodel.NewStateBuilder(l, bottom)
	return l.stateBuilder
}
