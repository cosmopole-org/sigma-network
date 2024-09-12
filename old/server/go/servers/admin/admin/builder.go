package admin_builder

import (
	godsecurity "sigma/admin/admin/tools"
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
	services.CreateAuthService(sigmaApp.Shell.Toolbox())
	services.LoadAuthGrpcService(sigmaApp.Shell.Toolbox().Net().GrpcServer.Server)
	return admin
}
