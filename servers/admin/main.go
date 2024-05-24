package main

import (
	"os"
	admin_builder "sigma/admin/admin"
	"sigma/admin/admin/models"
	sigma "sigma/admin/shell"
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
		panic(err.Error())
	}

	adminApp := admin_builder.BuildAdmin(
		os.Getenv("FED_ORIGIN"),
		sigma.ShellConfig{
			DbUri:       os.Getenv("POSTGRES_URI"),
			MemUri:      os.Getenv("REDIS_URI"),
			StorageRoot: os.Getenv("STORAGE_ROOT_PATH"),
			Federation:  false,
			CoreAccess:  false,
		},
		[]models.Admin{
			{Email: "mani@midopia.com", FirstName: "mani", LastName: "shabanzadeh"},
			{Email: "aras@midopia.com", FirstName: "aras", LastName: "mehranfar"},
			{Email: "shahin@midopia.com", FirstName: "shahin", LastName: "charkhosht"},
			{Email: "amir@midopia.com", FirstName: "amir", LastName: "ebadi"},
		},
	)

	adminApp.SigmaApp.ConnectToNetwork(map[string]int{
		"http": int(port),
	})

	<-quit
}
