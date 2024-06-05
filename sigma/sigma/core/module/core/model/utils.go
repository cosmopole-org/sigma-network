package module_actor_model

import "sigma/main/sigma/abstract"

type Utils struct {
	log abstract.Log
}



func (u *Utils) Act(args ...interface{}) {
	u.log(args...)
}
