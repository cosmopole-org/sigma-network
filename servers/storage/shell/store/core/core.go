package core

import "sigma/storage/core/modules"

func Core() *modules.App {
	return modules.GetApp()
}
