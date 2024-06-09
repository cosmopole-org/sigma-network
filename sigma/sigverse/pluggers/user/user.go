
	package plugger_user

	import (
		"sigma/sigma/abstract"
		"sigma/sigma/utils"
		module_logger "sigma/sigma/core/module/logger"
		actions "sigma/sigverse/actions/user"
	)
	
	type Plugger struct {
		Id      *string
		Actions *actions.Actions
		Logger *module_logger.Logger
		Core abstract.ICore
	}
	
		func (c *Plugger) Authenticate() abstract.IAction {
			return utils.ExtractSecureAction(c.Logger, c.Core, c.Actions.Authenticate)
		}
		
		func (c *Plugger) Create() abstract.IAction {
			return utils.ExtractSecureAction(c.Logger, c.Core, c.Actions.Create)
		}
		
		func (c *Plugger) Update() abstract.IAction {
			return utils.ExtractSecureAction(c.Logger, c.Core, c.Actions.Update)
		}
		
		func (c *Plugger) Get() abstract.IAction {
			return utils.ExtractSecureAction(c.Logger, c.Core, c.Actions.Get)
		}
		
		func (c *Plugger) Delete() abstract.IAction {
			return utils.ExtractSecureAction(c.Logger, c.Core, c.Actions.Delete)
		}
		
	func (c *Plugger) Install() {
		// pass
	}
	
	func New(actions *actions.Actions, logger *module_logger.Logger, core abstract.ICore) *Plugger {
		id := "user"
		return &Plugger{Id: &id, Actions: actions, Core: core, Logger: logger}
	}
	