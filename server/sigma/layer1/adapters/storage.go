package adapters

import (
	"sigma/sigma/abstract"
	adapters_model "sigma/sigma/layer1/adapters/model"

	"gorm.io/gorm"
)

type IStorage interface {
	Db() *gorm.DB
	Create(...interface{}) IStorage
	Save(...interface{}) IStorage
	Delete(...interface{}) IStorage
	Find(...interface{}) IStorage
	Where(...interface{}) IStorage
	Select(...interface{}) IStorage
	First(...interface{}) IStorage
	Last(...interface{}) IStorage
	Model(...interface{}) IStorage
	Count(...interface{}) IStorage
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
	Push(...bool)
	Revert()
	Used() bool
	Offset(args ...interface{}) ITrx
	Limit(args ...interface{}) ITrx
	Or(...interface{}) ITrx
	Clauses(...interface{}) ITrx
	UpdateJson(abstract.IModel, string, string, any) ITrx
	SaveDataUnit(arg *adapters_model.DataUnit) ITrx
	Create(abstract.IModel) ITrx
	Save(abstract.IModel) ITrx
	Delete(abstract.IModel) ITrx
	Find(...interface{}) ITrx
	Where(...interface{}) ITrx
	Model(...interface{}) ITrx
	Select(...interface{}) ITrx
	First(...interface{}) ITrx
	Last(...interface{}) ITrx
	Count(...interface{}) ITrx
	AutoMigrate(...interface{}) error
}
