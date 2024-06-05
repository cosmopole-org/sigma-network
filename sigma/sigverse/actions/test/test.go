package action_test

import (
	"sigma/sigma/abstract"
	"sigma/sigverse/inputs"
)

type Actions struct {
	Layer abstract.ILayer
}

// Hello /api/hello check [ false false false ] access [ true false false false POST ]
func (a *Actions) Hello(state abstract.IState, input inputs.HelloInput) (any, error) {
	return `hello ` + input.Name, nil
}
