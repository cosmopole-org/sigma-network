
	package plugger_space

	import (
		"sigma/sigma/abstract"
		"sigma/sigma/utils"
		module_logger "sigma/sigma/core/module/logger"
		actions "sigma/sigverse/actions/space"
	)
	
	type Plugger struct {
		Id      *string
		Actions *actions.Actions
		Logger *module_logger.Logger
		Core abstract.ICore
	}
	
		func (c *Plugger) AddMember() abstract.IAction {
			return utils.ExtractSecureAction(c.Logger, c.Core, c.Actions.AddMember)
		}
		
		func (c *Plugger) RemoveMember() abstract.IAction {
			return utils.ExtractSecureAction(c.Logger, c.Core, c.Actions.RemoveMember)
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
		
		func (c *Plugger) Join() abstract.IAction {
			return utils.ExtractSecureAction(c.Logger, c.Core, c.Actions.Join)
		}
		
	func (c *Plugger) Install(layer abstract.ILayer) *Plugger {
		actions.Install(layer.Sb().NewState())
		return c
	}

	func New(actions *actions.Actions, logger *module_logger.Logger, core abstract.ICore) *Plugger {
		id := "space"
		return &Plugger{Id: &id, Actions: actions, Core: core, Logger: logger}
	}
	