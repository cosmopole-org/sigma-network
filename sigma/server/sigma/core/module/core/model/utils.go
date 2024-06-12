package module_core_model

import "sigma/sigma/abstract"

type Utils struct {
	log abstract.Log
}

func NewUtils(log abstract.Log) *Utils {
	return &Utils{log: log}
}

func (u *Utils) Log(args ...interface{}) {
	u.log(args...)
}
