package module_actor_model

import "sigma/main/sigma/abstract"

type Func func(state abstract.IState, input abstract.IInput) (any, error)

type Action struct {
	Guard Guard
	Func  Func
}

func (a *Action) Act(state abstract.IState, input abstract.IInput) (int, any, error) {
	result, err := a.Func(state, input)
	if err != nil {
		return 0, nil, err
	}
	return 1, result, nil
}
