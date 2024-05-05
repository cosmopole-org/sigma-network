package main

import (
	"os"
	app "sigma/main/shell"
	"strconv"

	"github.com/joho/godotenv"
)



var quit = make(chan struct{})

func main() {

	err := godotenv.Load()
	if err != nil {
		panic(err)
	}

	port, err := strconv.ParseInt(os.Getenv("PORT"), 10, 64)
	if err != nil {
		panic(err)
	}

	app.New(
		os.Getenv("PORT"),
		os.Getenv("POSTGRES_URI"),
		os.Getenv("POSTGRES_DB")+"_"+os.Getenv("PORT"),
		os.Getenv("REDIS_URI"),
		os.Getenv("STORAGE_ROOT_PATH"),
		map[string]int{
			"http": int(port),
		},
		os.Getenv("MAP_SERVER"),
	)

	<-quit
}
