package actions_dummy

import (
	"encoding/json"
	"os"
	"sigma/sigma/abstract"
	"sigma/sigverse/inputs"
	"time"
)

type Actions struct {
	Layer abstract.ILayer
}

func Install(s abstract.IState, a *Actions) error {
	return nil
}

// Hello /api/hello check [ false false false ] access [ true false false false GET ]
func (a *Actions) Hello(_ abstract.IState, _ inputs.HelloInput) (any, error) {
	return `{ "hello": "world" }`, nil
}

// Time /api/time check [ false false false ] access [ true false false false GET ]
func (a *Actions) Time(_ abstract.IState, _ inputs.HelloInput) (any, error) {
	res, err := json.Marshal(map[string]any{"time": time.Now().UnixMilli()})
	return res, err
}

// Ping /api/ping check [ false false false ] access [ true false false false GET ]
func (a *Actions) Ping(_ abstract.IState, _ inputs.HelloInput) (any, error) {
	return os.Getenv("MAIN_PORT"), nil
}
