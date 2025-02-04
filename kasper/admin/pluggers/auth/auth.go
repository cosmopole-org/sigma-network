
	package plugger_auth

	import (
		"sigma/sigma/abstract"
		"sigma/sigma/utils"
		module_logger "sigma/sigma/core/module/logger"
		actions "sigma/admin/actions/auth"
	)
	
	type Plugger struct {
		Id      *string
		Actions *actions.Actions
		Logger *module_logger.Logger
		Core abstract.ICore
	}
	
		func (c *Plugger) Login() abstract.IAction {
			return utils.ExtractSecureAction(c.Logger, c.Core, c.Actions.Login)
		}
		
		func (c *Plugger) ChangePass() abstract.IAction {
			return utils.ExtractSecureAction(c.Logger, c.Core, c.Actions.ChangePass)
		}
		
	func (c *Plugger) Install(layer abstract.ILayer, a *actions.Actions) *Plugger {
		s := layer.Sb().NewState()	
		err := actions.Install(s, a)
		if err != nil {
			panic(err)
		}
		return c
	}

	func New(actions *actions.Actions, logger *module_logger.Logger, core abstract.ICore) *Plugger {
		id := "auth"
		return &Plugger{Id: &id, Actions: actions, Core: core, Logger: logger}
	}
	