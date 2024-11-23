
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
		
		func (c *Plugger) UpdateMember() abstract.IAction {
			return utils.ExtractSecureAction(c.Logger, c.Core, c.Actions.UpdateMember)
		}
		
		func (c *Plugger) ReadMembers() abstract.IAction {
			return utils.ExtractSecureAction(c.Logger, c.Core, c.Actions.ReadMembers)
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
		
		func (c *Plugger) CreateGroup() abstract.IAction {
			return utils.ExtractSecureAction(c.Logger, c.Core, c.Actions.CreateGroup)
		}
		
		func (c *Plugger) CreatePrivate() abstract.IAction {
			return utils.ExtractSecureAction(c.Logger, c.Core, c.Actions.CreatePrivate)
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
		id := "space"
		return &Plugger{Id: &id, Actions: actions, Core: core, Logger: logger}
	}
	