package admin_builder

import (
	godsecurity "sigma/admin/admin/managers"
	"sigma/admin/admin/models"
	"sigma/admin/admin/services"
	sigma "sigma/admin/shell"
)

type Admin struct {
	GodSecurity *godsecurity.Security
	Shell       *sigma.Shell
}

func BuildAdmin(appId string, config sigma.ShellConfig, gods []models.Admin) *Admin {
	shell := sigma.New(
		appId,
		config,
	)
	admin := &Admin{
		Shell: shell,
	}
	admin.GodSecurity = godsecurity.CreateSecurity(shell.Core(), gods)
	services.CreateAuthService(shell.Core(), shell.Managers())
	services.LoadAuthGrpcService(shell.Managers().NetManager().GrpcServer.Server)
	return admin
}
