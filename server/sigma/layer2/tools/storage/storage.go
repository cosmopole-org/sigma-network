package tool_storage

import (
	"log"
	"os"
	"sigma/sigma/abstract"
	modulelogger "sigma/sigma/core/module/logger"
	"sigma/sigma/layer1/adapters"
	adapters_model "sigma/sigma/layer1/adapters/model"
	"strings"
	"time"

	datatypes "gorm.io/datatypes"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
	"gorm.io/gorm/logger"
)

type StorageManager struct {
	core        abstract.ICore
	logger      *modulelogger.Logger
	storageRoot string
	db          *gorm.DB
	chain       chan []abstract.Change
}

func (sm *StorageManager) StorageRoot() string {
	return sm.storageRoot
}
func (sm *StorageManager) Db() *gorm.DB {
	return sm.db
}
func (sm *StorageManager) Create(args ...interface{}) adapters.IStorage {
	sm.db.Create(args[0])
	return sm
}
func (sm *StorageManager) Save(args ...interface{}) adapters.IStorage {
	sm.db.Save(args[0])
	return sm
}
func (sm *StorageManager) Count(args ...interface{}) adapters.IStorage {
	sm.db.Count(args[0].(*int64))
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
func (sm *StorageManager) Last(args ...interface{}) adapters.IStorage {
	if len(args) > 1 {
		sm.db.Last(args[0], args[1:]...)
	} else {
		sm.db.Last(args[0])
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
			for j := i; j < len(pathParts)-1; j++ {
				next := map[string]interface{}{}
				rootTemp[pathParts[j]] = next
				rootTemp = next
			}
			rootTemp[pathParts[len(pathParts)-1]] = value
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
	return &TrxWrapper{core: sm.core, trx: sm.db, db: sm.db, used: false, changes: []abstract.Change{}, chain: sm.chain}
}

type TrxWrapper struct {
	chain   chan []abstract.Change
	core    abstract.ICore
	db      *gorm.DB
	bTrx    *gorm.DB
	trx     *gorm.DB
	err     error
	used    bool
	changes []abstract.Change
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

func (sm *TrxWrapper) Push(options ...bool) {
	sm.Reset()
	//sm.chain <- sm.changes
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
func (sm *TrxWrapper) UpdateJson(entity abstract.IModel, column string, pathDot string, value any) adapters.ITrx {
	log.Println("-----------------------------")
	log.Println(entity)
	log.Println(column)
	log.Println(pathDot)
	log.Println(value)
	log.Println("-----------------------------")
	sm.err = nil
	var finalValue = value
	trx := sm.trx
	sm.Reset()
	object := abstract.JsonUpdate{Entity: entity, Column: column, Path: pathDot, Value: value}
	sm.changes = append(sm.changes, abstract.Change{Method: "update-json", Typ: object.Type(), Model: object})
	if pathDot == "" {
		sm.err = trx.UpdateColumn(column, finalValue).Error
		sm.trx = trx
		return sm
	}
	pathParts := strings.Split(pathDot, ".")
	path := "{" + strings.Join(pathParts, ",") + "}"
	if entity == nil {
		sm.err = trx.UpdateColumn(column, datatypes.JSONSet(column).Set(path, finalValue)).Error
		sm.trx = trx
		return sm
	}
	for i := 1; i < len(pathParts); i++ {
		err := sm.trx.First(entity, datatypes.JSONQuery(column).HasKey(pathParts[0:i]...)).Error
		if err != nil {
			path = "{" + strings.Join(pathParts[0:i], ",") + "}"
			root := map[string]interface{}{}
			rootTemp := root
			for j := i; j < len(pathParts)-1; j++ {
				next := map[string]interface{}{}
				rootTemp[pathParts[j]] = next
				rootTemp = next
			}
			rootTemp[pathParts[len(pathParts)-1]] = value
			finalValue = root
			sm.Reset()
			break
		} else {
			finalValue = value
			sm.Reset()
		}
	}
	sm.err = trx.UpdateColumn(column, datatypes.JSONSet(column).Set(path, finalValue)).Error
	sm.trx = trx
	return sm
}
func (sm *TrxWrapper) SaveDataUnit(arg *adapters_model.DataUnit) adapters.ITrx {
	sm.changes = append(sm.changes, abstract.Change{Method: "create", Typ: arg.Type(), Model: arg})
	return sm.Create(arg)
}
func (sm *TrxWrapper) Create(arg abstract.IModel) adapters.ITrx {
	sm.changes = append(sm.changes, abstract.Change{Method: "create", Typ: arg.Type(), Model: arg})
	sm.err = nil
	sm.err = sm.trx.Create(arg).Error
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
func (sm *TrxWrapper) Save(arg abstract.IModel) adapters.ITrx {
	sm.changes = append(sm.changes, abstract.Change{Method: "update", Typ: arg.Type(), Model: arg})
	sm.err = nil
	sm.err = sm.trx.Save(arg).Error
	return sm
}
func (sm *TrxWrapper) Delete(arg abstract.IModel) adapters.ITrx {
	sm.changes = append(sm.changes, abstract.Change{Method: "delete", Typ: arg.Type(), Model: arg})
	sm.err = nil
	sm.trx.Delete(arg)
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
func (sm *TrxWrapper) Last(args ...interface{}) adapters.ITrx {
	sm.err = nil
	if len(args) > 1 {
		sm.trx.Last(args[0], args[1:]...)
	} else {
		sm.trx.Last(args[0])
	}
	sm.err = sm.trx.Error
	return sm
}
func (sm *TrxWrapper) AutoMigrate(args ...interface{}) error {
	return sm.trx.AutoMigrate(args...)
}

// var blockCount = int64(0)

func NewStorage(core abstract.ICore, logger2 *modulelogger.Logger, storageRoot string, dialector gorm.Dialector, chain chan []abstract.Change) *StorageManager {
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
	return &StorageManager{core: core, db: db, storageRoot: storageRoot, logger: logger2, chain: chain}
}
