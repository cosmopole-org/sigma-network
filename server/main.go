package main

import (
	"fmt"
	"log"
	"os"
	pluggeradmin "sigma/admin/main"
	pluggerpluginer "sigma/pluginer/main"
	"sigma/sigma"
	"sigma/sigma/abstract"
	modulelogger "sigma/sigma/core/module/logger"
	layer1 "sigma/sigma/layer1/layer"
	layer2 "sigma/sigma/layer2/layer"
	modulemodel2 "sigma/sigma/layer2/model"
	layer3 "sigma/sigma/layer3/layer"
	modulemodel3 "sigma/sigma/layer3/model"
	pluggersigverse "sigma/sigverse/main"
	pluggersocial "sigma/social/main"
	"time"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"

	"sigma/sigma/layer2/tools/chain/hashgraph"
)

var noExit = make(chan int)

func main() {

	err := godotenv.Load()
	if err != nil {
		panic(err)
	}

	logger := new(modulelogger.Logger)

	logger.Println("Welcome to Sigma !")

	app := sigma.NewApp(sigma.Config{
		Id:  "sigma",
		Log: logger.Println,
	})
	app.Load(
		[]string{
			"keyhan",
		},
		[]abstract.ILayer{
			layer1.New(),
			layer2.New(),
			layer3.New(),
		},
		[]interface{}{
			logger,
			os.Getenv("STORAGE_ROOT_PATH"),
			postgres.Open(os.Getenv("DB_URI")),
			os.Getenv("REDIS_URI"),
			[]string{},
			"9001",
		},
	)
	pluggersigverse.PlugAll(app.Get(1), logger, app)
	pluggeradmin.PlugAll(app.Get(1), logger, app)
	pluggerpluginer.PlugAll(app.Get(2), logger, app)
	pluggersocial.PlugAll(app.Get(2), logger, app)

	abstract.UseToolbox[*modulemodel3.ToolboxL3](app.Get(3).Tools()).Net().Run(
		map[string]int{
			"http": 8081,
		},
	)

	chain := abstract.UseToolbox[*modulemodel2.ToolboxL2](app.Get(2).Tools()).Chain()
	chain.Run()

	for i := 0; i < 100; i++ {
		transactions := [][]hashgraph.Transaction{}
		for _, e := range chain.Node.ConsensusEvents {
			transactions = append(transactions, e.Transactions)
		}
		log.Println(transactions)

		chain.PerformTransaction(fmt.Sprintf("nazanin-%d", i), float64(i+100))
		time.Sleep(time.Duration(2) * time.Second)
	}

	<-noExit
}
