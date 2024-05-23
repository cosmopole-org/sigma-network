package admin_builder

import (
	godsecurity "sigma/admin/admin/managers"
	"sigma/admin/admin/services"
	"sigma/admin/core/models"
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
	admin.GodSecurity = godsecurity.CreateSecurity(gods)
	services.CreateAuthService(sigmaApp.Managers())
	services.LoadAuthGrpcService(sigmaApp.Managers().NetManager().GrpcServer.Server)
	return admin
}
