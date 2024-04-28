package main

import (
	"os"
	"sigma/admin/core/core"
	"sigma/admin/core/models"
	"sigma/admin/core/network"

	"github.com/joho/godotenv"
)

var quit = make(chan struct{})

func main() {

	err := godotenv.Load()
	if err != nil {
		panic(err)
	}

	app := core.CreateApp(
		"sigma-sample",
		os.Getenv("POSTGRES_URI"),
		os.Getenv("REDIS_URI"),
		os.Getenv("STORAGE_ROOT_PATH"),
		[]models.Admin{
			{Email: "mani@midopia.com", FirstName: "mani", LastName: "shabanzadeh"},
			{Email: "aras@midopia.com", FirstName: "aras", LastName: "mehranfar"},
			{Email: "shahin@midopia.com", FirstName: "shahin", LastName: "charkhosht"},
			{Email: "amir@midopia.com", FirstName: "amir", LastName: "ebadi"},
		},
	)

	app.GetNetwork().Listen(network.CreateListenOptions(true, 8085, false, 0))

	<-quit
}
