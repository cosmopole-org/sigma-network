
	package plugger_interact

	import (
		"sigma/sigma/abstract"
		"sigma/sigma/utils"
		module_logger "sigma/sigma/core/module/logger"
		actions "sigma/sigverse/actions/interact"
	)
	
	type Plugger struct {
		Id      *string
		Actions *actions.Actions
		Logger *module_logger.Logger
		Core abstract.ICore
	}
	
		func (c *Plugger) GetCode() abstract.IAction {
			return utils.ExtractSecureAction(c.Logger, c.Core, c.Actions.GetCode)
		}
		
		func (c *Plugger) GetInviteCode() abstract.IAction {
			return utils.ExtractSecureAction(c.Logger, c.Core, c.Actions.GetInviteCode)
		}
		
		func (c *Plugger) GetByCode() abstract.IAction {
			return utils.ExtractSecureAction(c.Logger, c.Core, c.Actions.GetByCode)
		}
		
		func (c *Plugger) Create() abstract.IAction {
			return utils.ExtractSecureAction(c.Logger, c.Core, c.Actions.Create)
		}
		
		func (c *Plugger) SendFriendRequest() abstract.IAction {
			return utils.ExtractSecureAction(c.Logger, c.Core, c.Actions.SendFriendRequest)
		}
		
		func (c *Plugger) UnfriendUser() abstract.IAction {
			return utils.ExtractSecureAction(c.Logger, c.Core, c.Actions.UnfriendUser)
		}
		
		func (c *Plugger) BlockUser() abstract.IAction {
			return utils.ExtractSecureAction(c.Logger, c.Core, c.Actions.BlockUser)
		}
		
		func (c *Plugger) UnblockUser() abstract.IAction {
			return utils.ExtractSecureAction(c.Logger, c.Core, c.Actions.UnblockUser)
		}
		
		func (c *Plugger) AcceptFriendRequest() abstract.IAction {
			return utils.ExtractSecureAction(c.Logger, c.Core, c.Actions.AcceptFriendRequest)
		}
		
		func (c *Plugger) DeclineFriendRequest() abstract.IAction {
			return utils.ExtractSecureAction(c.Logger, c.Core, c.Actions.DeclineFriendRequest)
		}
		
		func (c *Plugger) ReadBlockedList() abstract.IAction {
			return utils.ExtractSecureAction(c.Logger, c.Core, c.Actions.ReadBlockedList)
		}
		
		func (c *Plugger) ReadFriendList() abstract.IAction {
			return utils.ExtractSecureAction(c.Logger, c.Core, c.Actions.ReadFriendList)
		}
		
		func (c *Plugger) ReadFriendRequestList() abstract.IAction {
			return utils.ExtractSecureAction(c.Logger, c.Core, c.Actions.ReadFriendRequestList)
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
		id := "interact"
		return &Plugger{Id: &id, Actions: actions, Core: core, Logger: logger}
	}
	