package actions_dummy

import (
	"os"
	"sigma/main/layer1/inputs"
	"sigma/main/layer1/models"
)

type DummyActions struct {
	Context models.ISigmaContext
}

// Hello /api/hello check [ false false false ] access [ true false false false GET ]
func (a *DummyActions) Hello(state models.ISigmaStatePool, d inputs.HelloInput, info models.Info) (any, error) {
	return `{ "hello": "world" }`, nil
}

// Ping /api/ping check [ false false false ] access [ true false false false GET ]
func (a *DummyActions) Ping(state models.ISigmaStatePool, d inputs.HelloInput, info models.Info) (any, error) {
	return os.Getenv("MAIN_PORT"), nil
}
