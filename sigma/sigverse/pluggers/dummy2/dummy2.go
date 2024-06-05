
	package plugger_dummy2

	import (
		"sigma/main/sigma/abstract"
		"sigma/main/sigma/utils"
		actions "sigma/main/sigverse/actions/dummy2"
	)
	
	type Plugger struct {
		Id      *string
		Actions *actions.Actions
	}
	
		func (c *Plugger) Hello() abstract.IAction {
			return utils.ExtractAction(c.Actions.Hello)
		}
		
	func (c *Plugger) Install() {
		// pass
	}
	
	func New(actions *actions.Actions) *Plugger {
		id := "dummy2"
		return &Plugger{Id: &id, Actions: actions}
	}
	