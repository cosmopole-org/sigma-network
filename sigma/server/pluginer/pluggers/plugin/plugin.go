
	package plugger_plugin

	import (
		"sigma/sigma/abstract"
		"sigma/sigma/utils"
		module_logger "sigma/sigma/core/module/logger"
		actions "sigma/pluginer/actions/plugin"
	)
	
	type Plugger struct {
		Id      *string
		Actions *actions.Actions
		Logger *module_logger.Logger
		Core abstract.ICore
	}
	
		func (c *Plugger) Plug() abstract.IAction {
			return utils.ExtractSecureAction(c.Logger, c.Core, c.Actions.Plug)
		}
		
	func (c *Plugger) Install(layer abstract.ILayer) *Plugger {
		actions.Install(layer.Sb().NewState())
		return c
	}

	func New(actions *actions.Actions, logger *module_logger.Logger, core abstract.ICore) *Plugger {
		id := "plugin"
		return &Plugger{Id: &id, Actions: actions, Core: core, Logger: logger}
	}
	