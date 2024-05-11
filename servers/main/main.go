package main

import (
	"os"
	app "sigma/main/shell"
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

	app.New(
		origin + ".liara.run",
		app.AppConfig{
			DatabaseUri:  os.Getenv("POSTGRES_URI"),
			DatabaseName: os.Getenv("POSTGRES_DB"),
			MemoryUri:    os.Getenv("REDIS_URI"),
			StorageRoot:  os.Getenv("STORAGE_ROOT_PATH"),
			Ports: map[string]int{
				"http": int(port),
			},
			EnableFederation: true,
		},
	)

	<-quit
}
