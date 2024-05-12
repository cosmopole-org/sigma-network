package main

import (
	"bytes"
	"errors"
	"io/ioutil"
	"log"
	"net/http"
	"sync"
)

const serverUrl = "https://midopia-football.liara.run"

type Res struct {
	Message string `json:"message"`
}

func hello(i int, url string, client *http.Client, token string, body []byte, wg *sync.WaitGroup) {
	defer wg.Done()
	r, err := http.NewRequest("POST", url, bytes.NewBuffer(body))
	if err != nil {
		log.Println(err)
		return
	}
	r.Close = true
	r.Header.Add("Content-Type", "application/json")
	r.Header.Add("token", token)
	res, err := client.Do(r)
	if err != nil {
		log.Println(err)
		return
	}
	defer res.Body.Close()
	result, err := ioutil.ReadAll(res.Body)
	if err != nil {
		log.Println(err)
		return
	}
	log.Println(string(result))
	if res.StatusCode != http.StatusOK {
		log.Println(errors.New("request failed"))
	}
}

var body3 = []byte(`{}`)

func hello2(i int, client *http.Client, wg *sync.WaitGroup) {
	defer wg.Done()
	r, err := http.NewRequest("GET", serverUrl+"/api/hello", bytes.NewBuffer(body3))
	if err != nil {
		log.Println(err)
		return
	}
	r.Close = true
	res, err := client.Do(r)
	if err != nil {
		log.Println(err)
		return
	}
	defer res.Body.Close()
	result, err := ioutil.ReadAll(res.Body)
	if err != nil {
		log.Println(err)
		return
	}
	log.Println(string(result))
	if res.StatusCode != http.StatusOK {
		log.Println(errors.New("request failed"))
	}
}

func main() {
	// body := []byte(`{
	// 	"leagueLevel": 2
	// }`)

	// body2 := []byte(`{
	// 	"result": "win",
	// 	"goalP": 10,
	// 	"goalN": 0,
	// 	"leagueLevel": 2
	// }`)

	// client := &http.Client{
	// 	Timeout:   500 * time.Second,
	// 	Transport: &http.Transport{},
	// }

	// var wg sync.WaitGroup

	// println("started test.")

	// start := time.Now()

	// for i := 0; i < 1000; i++ {
	// 	wg.Add(1)
	// 	go hello2(i, client, &wg)
	// 	wg.Add(1)
	// 	go hello(i, serverUrl+"/players/readLeaderBoard", client, "SbZrFS4nnXWwYHX5y9mKiKTvvZuhoUan", body, &wg)
	// 	wg.Add(1)
	// 	go hello(i, serverUrl+"/players/submitScore", client, "SbZrFS4nnXWwYHX5y9mKiKTvvZuhoUan", body2, &wg)
	// }
	// wg.Wait()
	// elapsed := time.Since(start)
	// log.Println("Binomial took ", elapsed)
}
