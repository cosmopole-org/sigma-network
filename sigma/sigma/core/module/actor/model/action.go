package module_actor_model

import (
	"sigma/sigma/abstract"
)

type Func func(state abstract.IState, input abstract.IInput) (any, error)

type Action struct {
	key  string
	Func Func
}

func NewAction(key string, fn Func) abstract.IAction {
	return &Action{key: key, Func: fn}
}

func (a *Action) Key() string {
	return a.key
}

func (a *Action) Act(state abstract.IState, input abstract.IInput) (int, any, error) {
	result, err := a.Func(state, input)
	if err != nil {
		return 0, nil, err
	}
	return 1, result, nil
}
