package admin_builder

import (
	godsecurity "sigma/admin/admin/managers"
	"sigma/admin/admin/services"
	"sigma/admin/admin/models"
	sigma "sigma/admin/shell"
)

type Admin struct {
	GodSecurity *godsecurity.Security
	SigmaApp    *sigma.Sigma
}

func BuildAdmin(appId string, config sigma.ShellConfig, gods []models.Admin) *Admin {
	sigmaApp := sigma.New(
		appId,
		config,
	)
	admin := &Admin{
		SigmaApp: sigmaApp,
	}
	admin.GodSecurity = godsecurity.CreateSecurity(sigmaApp.Core(), gods)
	services.CreateAuthService(sigmaApp.Core(), sigmaApp.Managers())
	services.LoadAuthGrpcService(sigmaApp.Managers().NetManager().GrpcServer.Server)
	return admin
}
