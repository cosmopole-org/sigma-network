package storage

type IStorage interface {
	Error() error
	Create(...interface{}) IStorage
	Save(...interface{}) IStorage
	Delete(...interface{}) IStorage
	Find(...interface{}) IStorage
	Where(...interface{}) IStorage
	Select(...interface{}) IStorage
	Begin(...interface{}) IStorage
	Commit(...interface{}) IStorage
	SavePoint(...interface{}) IStorage
	Rollback(...interface{}) IStorage
	RollbackTo(...interface{}) IStorage
	First(...interface{}) IStorage
	AutoMigrate(...interface{}) IStorage
}

type IGlobStorage interface {
	Create(...interface{}) IGlobStorage
	Save(...interface{}) IGlobStorage
	Delete(...interface{}) IGlobStorage
	Find(...interface{}) IGlobStorage
	Where(...interface{}) IGlobStorage
	Select(...interface{}) IGlobStorage
	First(...interface{}) IGlobStorage
	AutoMigrate(...interface{}) IGlobStorage
	CreateTrx() IStorage
}
