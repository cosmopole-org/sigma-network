package admin_builder

import (
	godsecurity "sigma/admin/admin/managers"
	"sigma/admin/admin/models"
	"sigma/admin/admin/services"
	"sigma/admin/shell"
	sigma "sigma/admin/sigma"
)

type Admin struct {
	GodSecurity *godsecurity.Security
	Sigma       *sigma.Sigma
}

func BuildAdmin(appId string, config shell.Config, gods []*models.God) *Admin {
	sigmaApp := sigma.New(
		appId,
		config,
	)
	admin := &Admin{
		Sigma: sigmaApp,
	}
	admin.GodSecurity = godsecurity.CreateSecurity(sigmaApp.Core, gods)
	services.CreateAuthService(sigmaApp.Core, sigmaApp.Shell.Managers())
	services.LoadAuthGrpcService(sigmaApp.Shell.Managers().NetManager().GrpcServer.Server)
	return admin
}
