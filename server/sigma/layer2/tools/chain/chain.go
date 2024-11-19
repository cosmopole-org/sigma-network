package tool_chain

import (
	"crypto/sha256"
	"encoding"
	"encoding/json"
	"fmt"
	"log"
	"sigma/sigma/abstract"
	modulelogger "sigma/sigma/core/module/logger"
	"sigma/sigma/utils/crypto"
	"sync"
	"time"

	"gorm.io/gorm"
)

type Chain struct {
	core       abstract.ICore
	logger     *modulelogger.Logger
	TrxQueue   chan []abstract.Change
	db         *gorm.DB
	lastHash   string
	blockCount int64
	mutex      sync.Mutex
}

func (ch *Chain) Run(db *gorm.DB) {
	ch.db = db
	ch.db.AutoMigrate(&abstract.Block{})
	t := ch.db.Begin()
	t.Model(&abstract.Block{}).Count(&ch.blockCount)
	t.Model(&abstract.Block{}).Select("hash").Where("1 = 1").Last(&ch.lastHash)
	t.Commit()
	go (func() {
		for {
			trx := <-ch.TrxQueue
			if len(trx) > 0 {
				str, err := json.Marshal(trx)
				if err != nil {
					log.Println(err)
				}
				ch.mutex.Lock()

				ch.blockCount++
				block := abstract.Block{
					Id:        crypto.SecureUniqueId(ch.core.Id()),
					Index:     ch.blockCount,
					Changes:   string(str),
					Timestamp: time.Now().UnixMilli(),
					Prevhash:  ch.lastHash,
				}
				blockStr, err2 := json.Marshal(block)
				if err2 != nil {
					log.Println(blockStr)
				}
				first := sha256.New()
				first.Write(blockStr)
				marshaler, ok := first.(encoding.BinaryMarshaler)
				if !ok {
					log.Fatal("first does not implement encoding.BinaryMarshaler")
				}
				_, err3 := marshaler.MarshalBinary()
				if err3 != nil {
					log.Fatal("unable to marshal hash:", err3)
				}
				res := fmt.Sprintf("%x", first.Sum(nil))
				block.Hash = string(res)

				tx := ch.db.Begin()
				tx.Create(&block)
				tx.Commit()

				ch.lastHash = block.Hash

				ch.mutex.Unlock()
			}
		}
	})()
}

func NewChain(core abstract.ICore, logger *modulelogger.Logger) *Chain {
	logger.Println("loading blockchain...")
	return &Chain{core: core, logger: logger, TrxQueue: make(chan []abstract.Change), blockCount: 0, lastHash: "0"}
}
