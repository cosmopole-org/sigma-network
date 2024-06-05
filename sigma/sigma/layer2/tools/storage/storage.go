package io_storage

import (
	"log"
	"os"
	adapters "sigma/main/sigma/layer1/adapters"
	"time"

	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

type StorageManager struct {
	storageRoot string
	db          *gorm.DB
}

func (sm *StorageManager) StorageRoot() string {
	return sm.storageRoot
}
func (sm *StorageManager) Create(args ...interface{}) adapters.IStorage {
	sm.db.Create(args[0])
	return sm
}
func (sm *StorageManager) Save(args ...interface{}) adapters.IStorage {
	sm.db.Save(args[0])
	return sm
}
func (sm *StorageManager) Delete(args ...interface{}) adapters.IStorage {
	if len(args) > 1 {
		sm.db.Delete(args[0], args[1:]...)
	} else {
		sm.db.Delete(args[0])
	}
	return sm
}
func (sm *StorageManager) Find(args ...interface{}) adapters.IStorage {
	if len(args) > 1 {
		sm.db.Find(args[0], args[1:]...)
	} else {
		sm.db.Find(args[0])
	}
	return sm
}
func (sm *StorageManager) Where(args ...interface{}) adapters.IStorage {
	if len(args) > 1 {
		sm.db.Where(args[0], args[1:]...)
	} else {
		sm.db.Where(args[0])
	}
	return sm
}
func (sm *StorageManager) Select(args ...interface{}) adapters.IStorage {
	if len(args) > 1 {
		sm.db.Select(args[0], args[1:]...)
	} else {
		sm.db.Select(args[0])
	}
	return sm
}
func (sm *StorageManager) Begin(args ...interface{}) adapters.IStorage {
	sm.db.Begin()
	return sm
}
func (sm *StorageManager) Commit(args ...interface{}) adapters.IStorage {
	sm.db.Commit()
	return sm
}
func (sm *StorageManager) SavePoint(args ...interface{}) adapters.IStorage {
	sm.db.SavePoint(args[0].(string))
	return sm
}
func (sm *StorageManager) Rollback(args ...interface{}) adapters.IStorage {
	sm.db.Rollback()
	return sm
}
func (sm *StorageManager) RollbackTo(args ...interface{}) adapters.IStorage {
	sm.db.RollbackTo(args[0].(string))
	return sm
}
func (sm *StorageManager) First(args ...interface{}) adapters.IStorage {
	if len(args) > 1 {
		sm.db.First(args[0], args[1:]...)
	} else {
		sm.db.First(args[0])
	}
	return sm
}
func (sm *StorageManager) AutoMigrate(args ...interface{}) adapters.IStorage {
	sm.db.AutoMigrate(args...)
	return sm
}

func (s *StorageManager) CreateTrx() adapters.ITrx {
	trx := s.db.Begin()
	return &TrxWrapper{trx: trx}
}

type TrxWrapper struct {
	trx *gorm.DB
	err error
}

func (sm *TrxWrapper) Error() error {
	return sm.err
}
func (sm *TrxWrapper) Create(args ...interface{}) adapters.ITrx {
	sm.err = sm.trx.Create(args[0]).Error
	return sm
}
func (sm *TrxWrapper) Save(args ...interface{}) adapters.ITrx {
	sm.err = sm.trx.Save(args[0]).Error
	return sm
}
func (sm *TrxWrapper) Delete(args ...interface{}) adapters.ITrx {
	if len(args) > 1 {
		sm.err = sm.trx.Delete(args[0], args[1:]...).Error
	} else {
		sm.err = sm.trx.Delete(args[0]).Error
	}
	return sm
}
func (sm *TrxWrapper) Find(args ...interface{}) adapters.ITrx {
	if len(args) > 1 {
		sm.err = sm.trx.Find(args[0], args[1:]...).Error
	} else {
		sm.err = sm.trx.Find(args[0]).Error
	}
	return sm
}
func (sm *TrxWrapper) Where(args ...interface{}) adapters.ITrx {
	if len(args) > 1 {
		sm.err = sm.trx.Where(args[0], args[1:]...).Error
	} else {
		sm.err = sm.trx.Where(args[0]).Error
	}
	return sm
}
func (sm *TrxWrapper) Select(args ...interface{}) adapters.ITrx {
	if len(args) > 1 {
		sm.err = sm.trx.Select(args[0], args[1:]...).Error
	} else {
		sm.err = sm.trx.Select(args[0]).Error
	}
	return sm
}
func (sm *TrxWrapper) Begin(args ...interface{}) adapters.ITrx {
	sm.err = sm.trx.Begin().Error
	return sm
}
func (sm *TrxWrapper) Commit(args ...interface{}) adapters.ITrx {
	sm.err = sm.trx.Commit().Error
	return sm
}
func (sm *TrxWrapper) SavePoint(args ...interface{}) adapters.ITrx {
	sm.err = sm.trx.SavePoint(args[0].(string)).Error
	return sm
}
func (sm *TrxWrapper) Rollback(args ...interface{}) adapters.ITrx {
	sm.err = sm.trx.Rollback().Error
	return sm
}
func (sm *TrxWrapper) RollbackTo(args ...interface{}) adapters.ITrx {
	sm.err = sm.trx.RollbackTo(args[0].(string)).Error
	return sm
}
func (sm *TrxWrapper) First(args ...interface{}) adapters.ITrx {
	if len(args) > 1 {
		sm.err = sm.trx.First(args[0], args[1:]...).Error
	} else {
		sm.err = sm.trx.First(args[0]).Error
	}
	return sm
}
func (sm *TrxWrapper) AutoMigrate(args ...interface{}) adapters.ITrx {
	sm.err = sm.trx.AutoMigrate(args...)
	return sm
}

func NewStorage(storageRoot string, dialector gorm.Dialector) *StorageManager {
	log.Println("connecting to database...")
	newLogger := logger.New(
		log.New(os.Stdout, "\r\n", log.LstdFlags), // io writer
		logger.Config{
			SlowThreshold:             time.Second, // Slow SQL threshold
			LogLevel:                  logger.Info, // Log level
			IgnoreRecordNotFoundError: true,        // Ignore ErrRecordNotFound error for logger
			ParameterizedQueries:      true,        // Don't include params in the SQL log
			Colorful:                  false,       // Disable color
		},
	)
	db, err := gorm.Open(dialector, &gorm.Config{
		Logger: newLogger,
	})
	if err != nil {
		panic("failed to connect database")
	}
	return &StorageManager{db: db, storageRoot: storageRoot}
}
