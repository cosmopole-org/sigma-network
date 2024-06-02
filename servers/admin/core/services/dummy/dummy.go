package services_dummy

import (
	"os"
	"sigma/admin/core/inputs"
	"sigma/admin/core/models"
	"sigma/admin/core/runtime"
)

type DummyService struct {
	App *runtime.App
}

// Hello /api/hello check [ false false false ] access [ true false false false GET ]
func (s *DummyService) Hello(control *runtime.Control, d inputs.HelloInput, info models.Info) (any, error) {
	return `{ "hello": "world" }`, nil
}

// Ping /api/ping check [ false false false ] access [ true false false false GET ]
func (s *DummyService) Ping(control *runtime.Control, d inputs.HelloInput, info models.Info) (any, error) {
	return os.Getenv("MAIN_PORT"), nil
}
