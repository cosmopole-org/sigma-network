package actions_dummy

import (
	"os"
	"sigma/storage/core/inputs"
	"sigma/storage/core/models"
	"sigma/storage/core/runtime"
)

type DummyActions struct {
	App *runtime.App
}

// Hello /api/hello check [ false false false ] access [ true false false false GET ]
func (a *DummyActions) Hello(control *runtime.Control, d inputs.HelloInput, info models.Info) (any, error) {
	return `{ "hello": "world" }`, nil
}

// Ping /api/ping check [ false false false ] access [ true false false false GET ]
func (a *DummyActions) Ping(control *runtime.Control, d inputs.HelloInput, info models.Info) (any, error) {
	return os.Getenv("MAIN_PORT"), nil
}

