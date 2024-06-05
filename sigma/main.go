package main

import (
	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"os"
	"sigma/sigma"
	"sigma/sigma/abstract"
	modulelogger "sigma/sigma/core/module/logger"
	layer1 "sigma/sigma/layer1/layer"
	layer2 "sigma/sigma/layer2/layer"
	layer3 "sigma/sigma/layer3/layer"
	module_model "sigma/sigma/layer3/model"
	plugger_sigverse "sigma/sigverse/main"
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
		Id:  "sigma.cloud",
		Log: logger.Println,
	})
	app.Load(
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
		},
	)
	plugger_sigverse.PlugAll(app.Get(1), logger, app)
	abstract.UseToolbox[*module_model.ToolboxL3](app.Get(3).Tools()).Net().Run(
		map[string]int{
			"http": 9010,
		},
	)

	<-noExit
}
