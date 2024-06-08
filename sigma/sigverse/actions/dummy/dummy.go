package actions_dummy

import (
	"os"
	"sigma/sigma/abstract"
	"sigma/sigverse/inputs"
)

type DummyActions struct {
	layer abstract.ILayer
}

// Hello /api/hello check [ false false false ] access [ true false false false GET ]
func (a *DummyActions) Hello(_ abstract.IState, _ inputs.HelloInput) (any, error) {
	return `{ "hello": "world" }`, nil
}

// Ping /api/ping check [ false false false ] access [ true false false false GET ]
func (a *DummyActions) Ping(_ abstract.IState, _ inputs.HelloInput) (any, error) {
	return os.Getenv("MAIN_PORT"), nil
}
