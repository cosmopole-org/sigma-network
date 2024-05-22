package main

import (
	"os"
	sigma "sigma/main/shell"
	"strconv"

	"github.com/joho/godotenv"
)

var quit = make(chan struct{})

func main() {

	var origin = "cosmopole"

	err := godotenv.Load(origin + ".env")
	if err != nil {
		panic(err)
	}

	port, err := strconv.ParseInt(os.Getenv("MAIN_PORT"), 10, 64)
	if err != nil {
		panic(err)
	}

	sigmaApp := sigma.New(
		origin+".liara.run",
		sigma.ShellConfig{
			DbUri:       os.Getenv("POSTGRES_URI"),
			MemUri:      os.Getenv("REDIS_URI"),
			StorageRoot: os.Getenv("STORAGE_ROOT_PATH"),
			Federation:  true,
			CoreAccess:  os.Getenv("CORE_ACCESSIBLE") == "true",
		},
	)

	sigmaApp.ConnectToNetwork(map[string]int{"http": int(port)})
	
	<-quit
}
