
	package plugger_auth

	import (
		"sigma/sigma/abstract"
		"sigma/sigma/utils"
		module_logger "sigma/sigma/core/module/logger"
		actions "sigma/sigverse/actions/auth"
	)
	
	type Plugger struct {
		Id      *string
		Actions *actions.Actions
		Logger *module_logger.Logger
		Core abstract.ICore
	}
	
		func (c *Plugger) GetServerPublicKey() abstract.IAction {
			return utils.ExtractSecureAction(c.Logger, c.Core, c.Actions.GetServerPublicKey)
		}
		
		func (c *Plugger) GetServersMap() abstract.IAction {
			return utils.ExtractSecureAction(c.Logger, c.Core, c.Actions.GetServersMap)
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
	