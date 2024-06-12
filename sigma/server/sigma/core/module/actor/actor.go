package module_actor

import (
	"sigma/sigma/abstract"
)

type Actor struct {
	actionMap map[string]abstract.IAction
}

func NewActor() *Actor {
	return &Actor{actionMap: make(map[string]abstract.IAction)}
}

func (a *Actor) InjectService(service interface{}) {
}

func (a *Actor) InjectAction(action abstract.IAction) {
	a.actionMap[action.Key()] = action
}

func (a *Actor) FetchAction(key string) abstract.IAction {
	return a.actionMap[key]
}
