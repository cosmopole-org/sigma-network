
	package pluggers_topic

	import (
		"sigma/main/core/runtime"
		actions_topic "sigma/main/core/services/actions/topic"
	)
	
	type Plugger struct {
		Id      *string
		App     *runtime.App
		Actions *actions_topic.TopicActions
	}
	
		func (c *Plugger) Create() *runtime.Action {
			return runtime.ExtractFunction(c.App, c, c.Actions.Create)
		}
		
		func (c *Plugger) Update() *runtime.Action {
			return runtime.ExtractFunction(c.App, c, c.Actions.Update)
		}
		
		func (c *Plugger) Delete() *runtime.Action {
			return runtime.ExtractFunction(c.App, c, c.Actions.Delete)
		}
		
		func (c *Plugger) Get() *runtime.Action {
			return runtime.ExtractFunction(c.App, c, c.Actions.Get)
		}
		
		func (c *Plugger) Send() *runtime.Action {
			return runtime.ExtractFunction(c.App, c, c.Actions.Send)
		}
		
	func (c *Plugger) Install() {
		// pass
	}
	
	func New(app *runtime.App, actions *actions_topic.TopicActions) *Plugger {
		id := "topic"
		return &Plugger{Id: &id, App: app, Actions: actions}
	}
	