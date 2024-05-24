package main

import (
	"os"
	sigma "sigma/storage/shell"
	storage_builder "sigma/storage/storage"

	"strconv"

	"github.com/joho/godotenv"
)

var quit = make(chan struct{})

func main() {

	err := godotenv.Load()
	if err != nil {
		panic(err)
	}

	port, err := strconv.ParseInt(os.Getenv("MAIN_PORT"), 10, 32)
	if err != nil {
		panic("invalid port number")
	}

	storageApp := storage_builder.BuildStorage(
		os.Getenv("FED_ORIGIN"),
		sigma.ShellConfig{
			DbUri:       os.Getenv("POSTGRES_URI"),
			MemUri:      os.Getenv("REDIS_URI"),
			StorageRoot: os.Getenv("STORAGE_ROOT_PATH"),
			Federation:  os.Getenv("FEDERATIVE") == "true",
			CoreAccess:  false,
			MaxReqSize: 1000 * 1024 * 1024,
		},
	)

	storageApp.SigmaApp.ConnectToNetwork(map[string]int{"http": int(port)})

	<-quit
}
