
	package plugger_invite

	import (
		"sigma/sigma/abstract"
		"sigma/sigma/utils"
		module_logger "sigma/sigma/core/module/logger"
		actions "sigma/sigverse/actions/invite"
	)
	
	type Plugger struct {
		Id      *string
		Actions *actions.Actions
		Logger *module_logger.Logger
		Core abstract.ICore
	}
	
		func (c *Plugger) Create() abstract.IAction {
			return utils.ExtractSecureAction(c.Logger, c.Core, c.Actions.Create)
		}
		
		func (c *Plugger) Cancel() abstract.IAction {
			return utils.ExtractSecureAction(c.Logger, c.Core, c.Actions.Cancel)
		}
		
		func (c *Plugger) Accept() abstract.IAction {
			return utils.ExtractSecureAction(c.Logger, c.Core, c.Actions.Accept)
		}
		
		func (c *Plugger) Decline() abstract.IAction {
			return utils.ExtractSecureAction(c.Logger, c.Core, c.Actions.Decline)
		}
		
	func (c *Plugger) Install() {
		// pass
	}
	
	func New(actions *actions.Actions, logger *module_logger.Logger, core abstract.ICore) *Plugger {
		id := "invite"
		return &Plugger{Id: &id, Actions: actions, Core: core, Logger: logger}
	}
	