package tool_storage

import (
	"log"
	"os"
	modulelogger "sigma/sigma/core/module/logger"
	"sigma/sigma/layer1/adapters"
	"time"

	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

type StorageManager struct {
	logger      *modulelogger.Logger
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

func (sm *StorageManager) CreateTrx() adapters.ITrx {
	return &TrxWrapper{db: sm.db}
}

type TrxWrapper struct {
	db  *gorm.DB
	err error
}

func (sm *TrxWrapper) Error() error {
	return sm.err
}
func (sm *TrxWrapper) Use() {
	sm.db = sm.db.Begin()
}
func (sm *TrxWrapper) Create(args ...interface{}) adapters.ITrx {
	sm.err = sm.db.Create(args[0]).Error
	return sm
}
func (sm *TrxWrapper) Save(args ...interface{}) adapters.ITrx {
	sm.err = sm.db.Save(args[0]).Error
	return sm
}
func (sm *TrxWrapper) Delete(args ...interface{}) adapters.ITrx {
	if len(args) > 1 {
		sm.err = sm.db.Delete(args[0], args[1:]...).Error
	} else {
		sm.err = sm.db.Delete(args[0]).Error
	}
	return sm
}
func (sm *TrxWrapper) Find(args ...interface{}) adapters.ITrx {
	if len(args) > 1 {
		sm.err = sm.db.Find(args[0], args[1:]...).Error
	} else {
		sm.err = sm.db.Find(args[0]).Error
	}
	return sm
}
func (sm *TrxWrapper) Where(args ...interface{}) adapters.ITrx {
	if len(args) > 1 {
		sm.err = sm.db.Where(args[0], args[1:]...).Error
	} else {
		sm.err = sm.db.Where(args[0]).Error
	}
	return sm
}
func (sm *TrxWrapper) Select(args ...interface{}) adapters.ITrx {
	if len(args) > 1 {
		sm.err = sm.db.Select(args[0], args[1:]...).Error
	} else {
		sm.err = sm.db.Select(args[0]).Error
	}
	return sm
}
func (sm *TrxWrapper) Commit(args ...interface{}) adapters.ITrx {
	sm.err = sm.db.Commit().Error
	return sm
}
func (sm *TrxWrapper) SavePoint(args ...interface{}) adapters.ITrx {
	sm.err = sm.db.SavePoint(args[0].(string)).Error
	return sm
}
func (sm *TrxWrapper) Rollback(args ...interface{}) adapters.ITrx {
	sm.err = sm.db.Rollback().Error
	return sm
}
func (sm *TrxWrapper) RollbackTo(args ...interface{}) adapters.ITrx {
	sm.err = sm.db.RollbackTo(args[0].(string)).Error
	return sm
}
func (sm *TrxWrapper) First(args ...interface{}) adapters.ITrx {
	if len(args) > 1 {
		sm.err = sm.db.First(args[0], args[1:]...).Error
	} else {
		sm.err = sm.db.First(args[0]).Error
	}
	return sm
}
func (sm *TrxWrapper) AutoMigrate(args ...interface{}) adapters.ITrx {
	sm.err = sm.db.AutoMigrate(args...)
	return sm
}

func NewStorage(logger2 *modulelogger.Logger, storageRoot string, dialector gorm.Dialector) *StorageManager {
	logger2.Println("connecting to database...")
	newLogger := logger.New(
		log.New(os.Stdout, "\r\n", log.LstdFlags), // tools writer
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
	return &StorageManager{db: db, storageRoot: storageRoot, logger: logger2}
}
