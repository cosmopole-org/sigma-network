package storage_builder

import (
	sigma "sigma/storage/shell"
	"sigma/storage/storage/services"
)

type Storage struct {
	SigmaApp    *sigma.Shell
}

func BuildStorage(appId string, config sigma.ShellConfig) *Storage {
	sigmaApp := sigma.New(
		appId,
		config,
	)
	storage := &Storage{
		SigmaApp: sigmaApp,
	}
	services.CreateStorageService(sigmaApp.Core(), sigmaApp.Managers())
	return storage
}
