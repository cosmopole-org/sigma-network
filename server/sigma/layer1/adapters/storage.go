package adapters

type IStorage interface {
	Create(...interface{}) IStorage
	Save(...interface{}) IStorage
	Delete(...interface{}) IStorage
	Find(...interface{}) IStorage
	Where(...interface{}) IStorage
	Select(...interface{}) IStorage
	First(...interface{}) IStorage
	Model(...interface{}) IStorage
	UpdateJson(any, string, string, any) IStorage
	AutoMigrate(...interface{}) error
	StorageRoot() string
	CreateTrx() ITrx
}

type TrxOptions struct {
	Reset bool
}

type ITrx interface {
	Error() error
	Reset()
	Use()
	Push()
	Revert()
	Used() bool
	Offset(args ...interface{}) ITrx
	Limit(args ...interface{}) ITrx
	Or(...interface{}) ITrx
	Clauses(...interface{}) ITrx
	UpdateJson(any, string, string, any) ITrx
	Create(...interface{}) ITrx
	Save(...interface{}) ITrx
	Delete(...interface{}) ITrx
	Find(...interface{}) ITrx
	Where(...interface{}) ITrx
	Model(...interface{}) ITrx
	Select(...interface{}) ITrx
	First(...interface{}) ITrx
	Count(...interface{}) ITrx
	AutoMigrate(...interface{}) error
}
