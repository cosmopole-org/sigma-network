package adapters

type IStorage interface {
	Create(...interface{}) IStorage
	Save(...interface{}) IStorage
	Delete(...interface{}) IStorage
	Find(...interface{}) IStorage
	Where(...interface{}) IStorage
	Select(...interface{}) IStorage
	First(...interface{}) IStorage
	AutoMigrate(...interface{}) IStorage
	StorageRoot() string
	CreateTrx() ITrx
}

type ITrx interface {
	Error() error
	Use()
	Create(...interface{}) ITrx
	Save(...interface{}) ITrx
	Delete(...interface{}) ITrx
	Find(...interface{}) ITrx
	Where(...interface{}) ITrx
	Select(...interface{}) ITrx
	Commit(...interface{}) ITrx
	SavePoint(...interface{}) ITrx
	Rollback(...interface{}) ITrx
	RollbackTo(...interface{}) ITrx
	First(...interface{}) ITrx
	AutoMigrate(...interface{}) ITrx
}
