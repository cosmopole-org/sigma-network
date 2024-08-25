package tool_storage

import (
	"log"
	"os"
	modulelogger "sigma/sigma/core/module/logger"
	"sigma/sigma/layer1/adapters"
	"strings"
	"time"

	datatypes "sigma/sigma/lib/datatypes"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
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
func (sm *StorageManager) SavePoint(args ...interface{}) adapters.IStorage {
	sm.db.SavePoint(args[0].(string))
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
func (sm *StorageManager) AutoMigrate(args ...interface{}) error {
	return sm.db.AutoMigrate(args...)
}
func (sm *StorageManager) UpdateJson(entity any, column string, pathDot string, value any) adapters.IStorage {
	pathParts := strings.Split(pathDot, ".")
	path := "{" + strings.Join(pathParts, ",") + "}"
	var finalValue = value
	if entity == nil {
		sm.db.UpdateColumn(column, datatypes.JSONSet(column).Set(path, finalValue))
		return sm	
	}
	for i := 1; i < len(pathParts); i++ {
		err := sm.db.First(entity, datatypes.JSONQuery(column).HasKey(pathParts[0:i]...)).Error
		if err != nil {
			log.Println(err)
			path = "{" + strings.Join(pathParts[0:i], ",") + "}"
			root := map[string]interface{}{}
			rootTemp := root
			for j := i; j < len(pathParts) - 1; j++ {
				next := map[string]interface{}{}
				rootTemp[pathParts[j]] = next
				rootTemp = next
			}
			rootTemp[pathParts[len(pathParts) - 1]] = value
			finalValue = root
			break
		} else {
			finalValue = value
		}
	}
	sm.db.UpdateColumn(column, datatypes.JSONSet(column).Set(path, finalValue))
	return sm
}
func (sm *StorageManager) Model(args ...interface{}) adapters.IStorage {
	sm.db = sm.db.Model(args[0])
	return sm
}

func (sm *StorageManager) CreateTrx() adapters.ITrx {
	return &TrxWrapper{trx: sm.db, db: sm.db, used: false}
}

type TrxWrapper struct {
	db   *gorm.DB
	bTrx *gorm.DB
	trx  *gorm.DB
	err  error
	used bool
}

func (sm *TrxWrapper) Error() error {
	return sm.err
}
func (sm *TrxWrapper) Reset() {
	sm.trx.Error = nil
	sm.bTrx.Error = nil
	sm.trx = sm.bTrx
	sm.err = nil
}
func (sm *TrxWrapper) Use() {
	if !sm.used {
		sm.used = true
		trx := sm.db.Begin()
		sm.trx = trx
		sm.bTrx = trx
	} else {
		sm.Reset()
	}
}
func (sm *TrxWrapper) Used() bool {
	return sm.used
}
func (sm *TrxWrapper) Push() {
	sm.trx.Commit()
}
func (sm *TrxWrapper) Revert() {
	sm.trx.Rollback()
}
func (sm *TrxWrapper) Clauses(args ...interface{}) adapters.ITrx {
	var convertedArr []clause.Expression
	for _, arg := range args {
		convertedArr = append(convertedArr, arg.(clause.Expression))
	}
	sm.trx = sm.trx.Clauses(convertedArr...)
	return sm
}
func (sm *TrxWrapper) UpdateJson(entity any, column string, pathDot string, value any) adapters.ITrx {
	sm.err = nil
	pathParts := strings.Split(pathDot, ".")
	path := "{" + strings.Join(pathParts, ",") + "}"
	var finalValue = value
	trx := sm.trx
	sm.Reset()
	if entity == nil {
		sm.err = trx.UpdateColumn(column, datatypes.JSONSet(column).Set(path, finalValue)).Error
		sm.trx = trx
		return sm	
	}
	for i := 1; i < len(pathParts); i++ {
		err := sm.trx.First(entity, datatypes.JSONQuery(column).HasKey(pathParts[0:i]...)).Error
		if err != nil {
			log.Println(err, i)
			path = "{" + strings.Join(pathParts[0:i], ",") + "}"
			root := map[string]interface{}{}
			rootTemp := root
			for j := i; j < len(pathParts) - 1; j++ {
				next := map[string]interface{}{}
				rootTemp[pathParts[j]] = next
				rootTemp = next
			}
			rootTemp[pathParts[len(pathParts) - 1]] = value
			finalValue = root
			sm.Reset()
			break
		} else {
			finalValue = value
			sm.Reset()
		}
	}
	log.Println(column, path, finalValue)
	sm.err = trx.UpdateColumn(column, datatypes.JSONSet(column).Set(path, finalValue)).Error
	sm.trx = trx
	return sm
}
func (sm *TrxWrapper) Create(args ...interface{}) adapters.ITrx {
	log.Println(sm.trx.Error, sm.err)
	sm.err = nil
	sm.err = sm.trx.Create(args[0]).Error
	log.Println(sm.trx.Error, sm.err)
	return sm
}
func (sm *TrxWrapper) Offset(args ...interface{}) adapters.ITrx {
	sm.err = nil
	sm.trx = sm.trx.Offset(args[0].(int))
	sm.err = sm.trx.Error
	return sm
}
func (sm *TrxWrapper) Limit(args ...interface{}) adapters.ITrx {
	sm.err = nil
	sm.trx = sm.trx.Limit(args[0].(int))
	sm.err = sm.trx.Error
	return sm
}
func (sm *TrxWrapper) Count(args ...interface{}) adapters.ITrx {
	sm.err = nil
	sm.trx = sm.trx.Count(args[0].(*int64))
	sm.err = sm.trx.Error
	return sm
}
func (sm *TrxWrapper) Or(args ...interface{}) adapters.ITrx {
	sm.err = nil
	if len(args) > 1 {
		sm.trx = sm.trx.Or(args[0], args[1:]...)
	} else {
		sm.trx = sm.trx.Or(args[0])
	}
	sm.err = sm.trx.Error
	return sm
}
func (sm *TrxWrapper) Save(args ...interface{}) adapters.ITrx {
	sm.err = nil
	sm.err = sm.trx.Save(args[0]).Error
	return sm
}
func (sm *TrxWrapper) Delete(args ...interface{}) adapters.ITrx {
	sm.err = nil
	if len(args) > 1 {
		sm.trx.Delete(args[0], args[1:]...)
	} else {
		sm.trx.Delete(args[0])
	}
	sm.err = sm.trx.Error
	return sm
}
func (sm *TrxWrapper) Find(args ...interface{}) adapters.ITrx {
	sm.err = nil
	if len(args) > 1 {
		sm.trx.Find(args[0], args[1:]...)
	} else {
		sm.trx.Find(args[0])
	}
	sm.err = sm.trx.Error
	return sm
}
func (sm *TrxWrapper) Where(args ...interface{}) adapters.ITrx {
	sm.err = nil
	if len(args) > 1 {
		sm.trx = sm.trx.Where(args[0], args[1:]...)
	} else {
		sm.trx = sm.trx.Where(args[0])
	}
	sm.err = sm.trx.Error
	return sm
}
func (sm *TrxWrapper) Model(args ...interface{}) adapters.ITrx {
	sm.err = nil
	sm.trx = sm.trx.Model(args[0])
	sm.err = sm.trx.Error
	return sm
}
func (sm *TrxWrapper) Select(args ...interface{}) adapters.ITrx {
	sm.err = nil
	if len(args) > 1 {
		sm.trx = sm.trx.Select(args[0], args[1:]...)
	} else {
		sm.trx = sm.trx.Select(args[0])
	}
	sm.err = sm.trx.Error
	return sm
}
func (sm *TrxWrapper) First(args ...interface{}) adapters.ITrx {
	sm.err = nil
	if len(args) > 1 {
		sm.trx.First(args[0], args[1:]...)
	} else {
		sm.trx.First(args[0])
	}
	sm.err = sm.trx.Error
	return sm
}
func (sm *TrxWrapper) AutoMigrate(args ...interface{}) error {
	return sm.trx.AutoMigrate(args...)
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
