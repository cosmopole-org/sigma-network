package storage_builder

import (
	"sigma/storage/shell"
	sigma "sigma/storage/sigma"
	"sigma/storage/storage/services"
)

type Storage struct {
	Sigma    *sigma.Sigma
}

func BuildStorage(appId string, config shell.Config) *Storage {
	sigmaApp := sigma.New(
		appId,
		config,
	)
	storage := &Storage{
		Sigma: sigmaApp,
	}
	services.CreateStorageService(sigmaApp.Core, sigmaApp.Shell.Managers())
	return storage
}
