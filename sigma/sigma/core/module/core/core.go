package module_actor

import (
	"sigma/main/sigma/core/module/actor/model"
)

type Actor struct {
	actionMap map[string]*module_actor_model.Action
}

func NewActor() *Actor {
	return &Actor{actionMap: make(map[string]*module_actor_model.Action)}
}
