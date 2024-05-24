package modules

import (
	"sigma/admin/core/utils"
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

func NewApp(appId string, storageRoot string, coreAccess bool, dbUri string, memUri string, pusherConnector func(s string, op OriginPacket), logCb func(uint32, ...interface{})) *App {
	utils.RegisterLoggerCallback(logCb)
	utils.Log(5, "Creating app...")
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
