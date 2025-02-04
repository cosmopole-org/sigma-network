
	package plugger_message

	import (
		"sigma/sigma/abstract"
		"sigma/sigma/utils"
		module_logger "sigma/sigma/core/module/logger"
		actions "sigma/social/actions/message"
	)
	
	type Plugger struct {
		Id      *string
		Actions *actions.Actions
		Logger *module_logger.Logger
		Core abstract.ICore
	}
	
		func (c *Plugger) CreateMessage() abstract.IAction {
			return utils.ExtractSecureAction(c.Logger, c.Core, c.Actions.CreateMessage)
		}
		
		func (c *Plugger) UpdateMessage() abstract.IAction {
			return utils.ExtractSecureAction(c.Logger, c.Core, c.Actions.UpdateMessage)
		}
		
		func (c *Plugger) DeleteMessage() abstract.IAction {
			return utils.ExtractSecureAction(c.Logger, c.Core, c.Actions.DeleteMessage)
		}
		
		func (c *Plugger) ReadMessages() abstract.IAction {
			return utils.ExtractSecureAction(c.Logger, c.Core, c.Actions.ReadMessages)
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
		id := "message"
		return &Plugger{Id: &id, Actions: actions, Core: core, Logger: logger}
	}
	