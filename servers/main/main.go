package main

import (
	"os"
	sigma "sigma/main/shell"
	"strconv"

	"github.com/joho/godotenv"
)

var quit = make(chan struct{})

func main() {

	err := godotenv.Load()
	if err != nil {
		panic(err)
	}

	port, err := strconv.ParseInt(os.Getenv("MAIN_PORT"), 10, 64)
	if err != nil {
		panic(err)
	}

	sigmaApp := sigma.New(
		os.Getenv("FED_ORIGIN"),
		sigma.ShellConfig{
			DbUri:       os.Getenv("POSTGRES_URI"),
			MemUri:      os.Getenv("REDIS_URI"),
			StorageRoot: os.Getenv("STORAGE_ROOT_PATH"),
			Federation:  os.Getenv("FEDERATIVE") == "true",
			CoreAccess:  os.Getenv("CORE_ACCESSIBLE") == "true",
		},
	)

	sigmaApp.ConnectToNetwork(map[string]int{"http": int(port)})

	<-quit
}
