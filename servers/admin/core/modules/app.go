package modules

import (
	"sigma/admin/core/utils"

	"github.com/sirupsen/logrus"
)

type App struct {
	AppId       string
	Pusher      *Pusher
	Database    *Database
	Memory      *Memory
	Crypto      *Crypto
	Services    *Services
	StorageRoot string
	CoreAccess  bool
}

func NewApp(appId string, storageRoot string, coreAccess bool, dbUri string, memUri string, pusherConnector func(s string, op OriginPacket)) *App {
	utils.Log(logrus.DebugLevel, "Creating app...")
	a := &App{
		AppId:       appId,
		StorageRoot: storageRoot,
		CoreAccess:  coreAccess,
	}
	a.Crypto = CreateCrypto(a)
	a.Services = CreateServices(a)
	a.Database = CreateDatabase(dbUri)
	a.Memory = CreateMemory(memUri)
	a.Pusher = CreatePusher(a, pusherConnector)
	return a
}
