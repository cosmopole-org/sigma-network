package layer

import (
	"gorm.io/gorm"
	"sigma/sigma/abstract"
	moduleactor "sigma/sigma/core/module/actor"
	modulelogger "sigma/sigma/core/module/logger"
	toolbox2 "sigma/sigma/layer1/module/toolbox"
	modulemodel "sigma/sigma/layer2/model"
	toolcache "sigma/sigma/layer2/tools/cache"
	toolfile "sigma/sigma/layer2/tools/file"
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
	file := toolfile.NewFileTool(args[0].(*modulelogger.Logger))
	l.toolbox = modulemodel.NewTools(core, args[0].(*modulelogger.Logger), args[1].(string), storage, cache, file)
	return []interface{}{
		args[0],
		storage,
		cache,
		args[4],
	}
}

func (l *Layer) ForFill(_ abstract.ICore, args ...interface{}) {
	toolbox := abstract.UseToolbox[*modulemodel.ToolboxL2](l.toolbox)
	toolbox.ToolboxL1 = abstract.UseToolbox[*toolbox2.ToolboxL1](args[0])
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
