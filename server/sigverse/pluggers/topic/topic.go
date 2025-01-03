
	package plugger_topic

	import (
		"sigma/sigma/abstract"
		"sigma/sigma/utils"
		module_logger "sigma/sigma/core/module/logger"
		actions "sigma/sigverse/actions/topic"
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
		
		func (c *Plugger) Update() abstract.IAction {
			return utils.ExtractSecureAction(c.Logger, c.Core, c.Actions.Update)
		}
		
		func (c *Plugger) Delete() abstract.IAction {
			return utils.ExtractSecureAction(c.Logger, c.Core, c.Actions.Delete)
		}
		
		func (c *Plugger) Get() abstract.IAction {
			return utils.ExtractSecureAction(c.Logger, c.Core, c.Actions.Get)
		}
		
		func (c *Plugger) Read() abstract.IAction {
			return utils.ExtractSecureAction(c.Logger, c.Core, c.Actions.Read)
		}
		
		func (c *Plugger) Send() abstract.IAction {
			return utils.ExtractSecureAction(c.Logger, c.Core, c.Actions.Send)
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
		id := "topic"
		return &Plugger{Id: &id, Actions: actions, Core: core, Logger: logger}
	}
	