package main

import (
	"os"
	app "sigma/admin/shell"
	"sigma/admin/shell/models"
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
		panic(err.Error())
	}

	app.New(
		"8081",
		os.Getenv("POSTGRES_URI"),
		os.Getenv("POSTGRES_DB")+"_8081",
		os.Getenv("REDIS_URI"),
		os.Getenv("STORAGE_ROOT_PATH"),
		int(port),
		[]models.Admin{
			{Email: "mani@midopia.com", FirstName: "mani", LastName: "shabanzadeh"},
			{Email: "aras@midopia.com", FirstName: "aras", LastName: "mehranfar"},
			{Email: "shahin@midopia.com", FirstName: "shahin", LastName: "charkhosht"},
			{Email: "amir@midopia.com", FirstName: "amir", LastName: "ebadi"},
		},
	)

	<-quit
}
