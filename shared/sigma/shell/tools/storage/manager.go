package storage_manager

import (
	"log"
	"os"
	"sigma/main/core/tools/storage"
	"sigma/main/core/utils"
	"time"

	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

type StorageManager struct {
	Db *gorm.DB
}

func (sm *StorageManager) Create(args ...interface{}) storage.IStorage {
	sm.Db.Create(args[0])
	return sm
}
func (sm *StorageManager) Save(args ...interface{}) storage.IStorage {
	sm.Db.Save(args[0])
	return sm
}
func (sm *StorageManager) Delete(args ...interface{}) storage.IStorage {
	if len(args) > 1 {
		sm.Db.Delete(args[0], args[1:]...)
	} else {
		sm.Db.Delete(args[0])
	}
	return sm
}
func (sm *StorageManager) Find(args ...interface{}) storage.IStorage {
	if len(args) > 1 {
		sm.Db.Find(args[0], args[1:]...)
	} else {
		sm.Db.Find(args[0])
	}
	return sm
}
func (sm *StorageManager) Where(args ...interface{}) storage.IStorage {
	if len(args) > 1 {
		sm.Db.Where(args[0], args[1:]...)
	} else {
		sm.Db.Where(args[0])
	}
	return sm
}
func (sm *StorageManager) Select(args ...interface{}) storage.IStorage {
	if len(args) > 1 {
		sm.Db.Select(args[0], args[1:]...)
	} else {
		sm.Db.Select(args[0])
	}
	return sm
}
func (sm *StorageManager) Begin(args ...interface{}) storage.IStorage {
	sm.Db.Begin()
	return sm
}
func (sm *StorageManager) Commit(args ...interface{}) storage.IStorage {
	sm.Db.Commit()
	return sm
}
func (sm *StorageManager) SavePoint(args ...interface{}) storage.IStorage {
	sm.Db.SavePoint(args[0].(string))
	return sm
}
func (sm *StorageManager) Rollback(args ...interface{}) storage.IStorage {
	sm.Db.Rollback()
	return sm
}
func (sm *StorageManager) RollbackTo(args ...interface{}) storage.IStorage {
	sm.Db.RollbackTo(args[0].(string))
	return sm
}
func (sm *StorageManager) First(args ...interface{}) storage.IStorage {
	if len(args) > 1 {
		sm.Db.First(args[0], args[1:]...)
	} else {
		sm.Db.First(args[0])
	}
	return sm
}
func (sm *StorageManager) AutoMigrate(args ...interface{}) storage.IStorage {
	sm.Db.AutoMigrate(args...)
	return sm
}

func (s *StorageManager) CreateTrx() storage.ITrx {
	trx := s.Db.Begin()
	return &TrxWrapper{trx: trx}
}

type TrxWrapper struct {
	trx *gorm.DB
	err error
}

func (sm *TrxWrapper) Error() error {
	return sm.err
}
func (sm *TrxWrapper) Create(args ...interface{}) storage.ITrx {
	sm.err = sm.trx.Create(args[0]).Error
	return sm
}
func (sm *TrxWrapper) Save(args ...interface{}) storage.ITrx {
	sm.err = sm.trx.Save(args[0]).Error
	return sm
}
func (sm *TrxWrapper) Delete(args ...interface{}) storage.ITrx {
	if len(args) > 1 {
		sm.err = sm.trx.Delete(args[0], args[1:]...).Error
	} else {
		sm.err = sm.trx.Delete(args[0]).Error
	}
	return sm
}
func (sm *TrxWrapper) Find(args ...interface{}) storage.ITrx {
	if len(args) > 1 {
		sm.err = sm.trx.Find(args[0], args[1:]...).Error
	} else {
		sm.err = sm.trx.Find(args[0]).Error
	}
	return sm
}
func (sm *TrxWrapper) Where(args ...interface{}) storage.ITrx {
	if len(args) > 1 {
		sm.err = sm.trx.Where(args[0], args[1:]...).Error
	} else {
		sm.err = sm.trx.Where(args[0]).Error
	}
	return sm
}
func (sm *TrxWrapper) Select(args ...interface{}) storage.ITrx {
	if len(args) > 1 {
		sm.err = sm.trx.Select(args[0], args[1:]...).Error
	} else {
		sm.err = sm.trx.Select(args[0]).Error
	}
	return sm
}
func (sm *TrxWrapper) Begin(args ...interface{}) storage.ITrx {
	sm.err = sm.trx.Begin().Error
	return sm
}
func (sm *TrxWrapper) Commit(args ...interface{}) storage.ITrx {
	sm.err = sm.trx.Commit().Error
	return sm
}
func (sm *TrxWrapper) SavePoint(args ...interface{}) storage.ITrx {
	sm.err = sm.trx.SavePoint(args[0].(string)).Error
	return sm
}
func (sm *TrxWrapper) Rollback(args ...interface{}) storage.ITrx {
	sm.err = sm.trx.Rollback().Error
	return sm
}
func (sm *TrxWrapper) RollbackTo(args ...interface{}) storage.ITrx {
	sm.err = sm.trx.RollbackTo(args[0].(string)).Error
	return sm
}
func (sm *TrxWrapper) First(args ...interface{}) storage.ITrx {
	if len(args) > 1 {
		sm.err = sm.trx.First(args[0], args[1:]...).Error
	} else {
		sm.err = sm.trx.First(args[0]).Error
	}
	return sm
}
func (sm *TrxWrapper) AutoMigrate(args ...interface{}) storage.ITrx {
	sm.err = sm.trx.AutoMigrate(args...)
	return sm
}

func CreateDatabase(dialector gorm.Dialector) *StorageManager {
	utils.Log(5, "connecting to database...")
	newLogger := logger.New(
		log.New(os.Stdout, "\r\n", log.LstdFlags), // io writer
		logger.Config{
			SlowThreshold:             time.Second,   // Slow SQL threshold
			LogLevel:                  logger.Info, // Log level
			IgnoreRecordNotFoundError: true,          // Ignore ErrRecordNotFound error for logger
			ParameterizedQueries:      true,          // Don't include params in the SQL log
			Colorful:                  false,          // Disable color
		},
	)
	db, err := gorm.Open(dialector, &gorm.Config{
		Logger: newLogger,
	})
	if err != nil {
		panic("failed to connect database")
	}
	return &StorageManager{Db: db}
}
