package modules

type App struct {
	AppId       string
	Pusher      *Pusher
	Database    *Database
	Memory      *Memory
	Services    *Services
	StorageRoot string
	CoreAccess  bool
}

func NewApp(appId string, storageRoot string, coreAccess bool, dbUri string, memUri string, pusherConnector func(s string, op OriginPacket)) *App {
	a := &App{
		AppId:       appId,
		StorageRoot: storageRoot,
		CoreAccess:  coreAccess,
	}
	PutApp(a)
	a.Services = CreateServices()
	a.Database = CreateDatabase(dbUri)
	a.Memory = CreateMemory(memUri)
	a.Pusher = CreatePusher(pusherConnector)
	return a
}
