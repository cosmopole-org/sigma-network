package sigma

import (
	"sigma/sigma/abstract"
	modulecore "sigma/sigma/core/module/core"
)

type Sigma abstract.ICore

func NewApp(config Config) Sigma {
	return modulecore.NewCore(config.Id, config.Log)
}
