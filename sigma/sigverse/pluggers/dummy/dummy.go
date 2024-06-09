
	package plugger_dummy

	import (
		"sigma/sigma/abstract"
		"sigma/sigma/utils"
		module_logger "sigma/sigma/core/module/logger"
		actions "sigma/sigverse/actions/dummy"
	)
	
	type Plugger struct {
		Id      *string
		Actions *actions.Actions
		Logger *module_logger.Logger
		Core abstract.ICore
	}
	
		func (c *Plugger) Hello() abstract.IAction {
			return utils.ExtractSecureAction(c.Logger, c.Core, c.Actions.Hello)
		}
		
		func (c *Plugger) Ping() abstract.IAction {
			return utils.ExtractSecureAction(c.Logger, c.Core, c.Actions.Ping)
		}
		
	func (c *Plugger) Install() {
		// pass
	}
	
	func New(actions *actions.Actions, logger *module_logger.Logger, core abstract.ICore) *Plugger {
		id := "dummy"
		return &Plugger{Id: &id, Actions: actions, Core: core, Logger: logger}
	}
	