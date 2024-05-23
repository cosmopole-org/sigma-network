package core

import "sigma/admin/core/modules"

func Core() *modules.App {
	return modules.GetApp()
}
