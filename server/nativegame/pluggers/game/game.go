package plugger_nativegame

import (
	"sigma/sigma/abstract"
	module_logger "sigma/sigma/core/module/logger"
	actions "sigma/nativegame/actions/game"
	"sigma/sigma/utils"
)

type Plugger struct {
	Id      *string
	Actions *actions.Actions
	Logger  *module_logger.Logger
	Core    abstract.ICore
}

func (c *Plugger) Move() abstract.IAction {
	return utils.ExtractSecureAction(c.Logger, c.Core, c.Actions.Move)
}

func (c *Plugger) Echo() abstract.IAction {
	return utils.ExtractSecureAction(c.Logger, c.Core, c.Actions.Echo)
}

func (c *Plugger) Export() abstract.IAction {
	return utils.ExtractSecureAction(c.Logger, c.Core, c.Actions.Export)
}

func (c *Plugger) Install(layer abstract.ILayer, a *actions.Actions) *Plugger {
	s := layer.Sb().NewState()
	if err := actions.Install(s, a); err != nil {
		panic(err)
	}
	return c
}

func New(a *actions.Actions, logger *module_logger.Logger, core abstract.ICore) *Plugger {
	id := "nativegame"
	return &Plugger{Id: &id, Actions: a, Core: core, Logger: logger}
}
