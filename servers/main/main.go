package main

import (
	"os"
	app "sigma/main/shell"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

var quit = make(chan struct{})

func main() {

	err := godotenv.Load()
	if err != nil {
		panic(err)
	}

	portStr := strings.Split(os.Getenv("ORIGIN"), "->")[1]
	port, err := strconv.ParseInt(portStr, 10, 64)
	if err != nil {
		panic(err)
	}

	app.New(
		os.Getenv("ORIGIN"),
		os.Getenv("POSTGRES_URI"),
		os.Getenv("POSTGRES_DB")+"_"+portStr,
		os.Getenv("REDIS_URI"),
		os.Getenv("STORAGE_ROOT_PATH"),
		map[string]int{
			"http": int(port),
		},
		os.Getenv("MAP_SERVER"),
	)

	<-quit
}
