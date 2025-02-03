package game

import (
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"games/hokm/core"
	"games/hokm/inputs"
	"games/hokm/models"
	"log"
	"strconv"
	"strings"
)

var values = []string{
	"2",
	"3",
	"4",
	"5",
	"6",
	"7",
	"8",
	"9",
	"10",
	"11", //"sarbaz",
	"12", //"bibi",
	"13", //"shah",
	"14", //"as",
}

var mapOfNameToIndex = map[string]int{
	"2":  0,
	"3":  1,
	"4":  2,
	"5":  3,
	"6":  4,
	"7":  5,
	"8":  6,
	"9":  7,
	"10": 8,
	"11": 9,  //"sarbaz",
	"12": 10, //"bibi",
	"13": 11, //"shah",
	"14": 12, //"as",
}

var cardTypes = map[string]bool{
	"d": true,
	"p": true,
	"g": true,
	"k": true,
}

const cardCount = 52
const playerCount = 4
const direction = -1

// types ----------------------------------------------------------

type Game struct {
	SpaceId             string                  `json:"spaceId"`
	TopicId             string                  `json:"topicId"`
	MemberId            string                  `json:"memberId"`
	MembersToPlayersMap map[string]string       `json:"membersToPlayersMap"`
	MembersToTeamsMap   map[string]string       `json:"membersToTeamsMap"`
	Teams               map[string]*models.Team `json:"teams"`
	Players             []models.Player         `json:"players"`
	MembersIndex        map[string]int          `json:"membersIndex"`
	Hakem               string                  `json:"hakem"`
	Hokm                string                  `json:"hokm"`
	MapOfOptions        map[string]string       `json:"mapOfOptions"`
	History             []*GameSet              `json:"history"`
	StageCard           string                  `json:"stageCard"`
	PrevWinner          string                  `json:"prevWinner"`
}

type GameSet struct {
	Options []string `json:"options"`
}

// functions ---------------------------------------------------------

var game *Game

func createGame(spaceId string, topicId string, memberId string, ps []models.Player, callback func()) {
	core.LogData("creating game...")
	game = &Game{
		SpaceId:             spaceId,
		TopicId:             topicId,
		MemberId:            memberId,
		MembersToPlayersMap: make(map[string]string),
		MembersToTeamsMap:   make(map[string]string),
		Teams:               make(map[string]*models.Team),
		Players:             make([]models.Player, len(ps)),
		MembersIndex:        make(map[string]int),
		Hakem:               "",
		Hokm:                "",
		MapOfOptions:        make(map[string]string),
		History:             make([]*GameSet, 0),
		StageCard:           "",
		PrevWinner:          "",
	}
	game.Players = ps
	for i, p := range ps {
		game.MembersToPlayersMap[p.MemberId] = p.UserId
		game.MembersIndex[p.MemberId] = i
		game.MembersToTeamsMap[p.MemberId] = p.TeamId
		_, ok := game.Teams[p.TeamId]
		if !ok {
			game.Teams[p.TeamId] = &models.Team{Id: p.TeamId, Score: 0, MainScore: 0}
		}
	}

	fmt.Println("choosing hakem...")
	game.makeHakem(func() {
		fmt.Println("shuffling cards...")
		game.makeCardSet(func() {
			fmt.Println("starting first set...")
			game.startNewSet()

			fmt.Println()
			fmt.Println(game)
			fmt.Println()

			callback()
		})
	})
}

func SaveData(topicId string, memberId string, id string, data any) {
	str, err := json.Marshal(data)
	if err != nil {
		core.LogData(err.Error())
		return
	}
	message := map[string]any{
		"key":      "database/save",
		"id":       id,
		"topicId":  topicId,
		"memberId": memberId,
		"data":     base64.StdEncoding.EncodeToString(str),
	}
	str2, err2 := json.Marshal(message)
	if err2 != nil {
		core.LogData(err2.Error())
		return
	}
	core.Message(string(str2))
}

var callbacks = map[string]func(string){}
var randCallbacks = map[string]func(int){}
var randGroupCallbacks = map[string]func([]int){}
var callbackCounter = 1

func GenRand(max int, callback func(number int)) {
	callbackCounter++
	callbackId := fmt.Sprintf("%d", callbackCounter)
	randCallbacks[callbackId] = callback
	message := map[string]any{
		"key":        "math/genRand",
		"callbackId": callbackId,
		"max":        fmt.Sprintf("%d", max),
	}
	str2, err2 := json.Marshal(message)
	if err2 != nil {
		core.LogData(err2.Error())
		return
	}
	fmt.Println(string(str2))
	core.Message(string(str2))
}

func GenRandGroup(max int, callback func(numbers []int)) {
	callbackCounter++
	callbackId := fmt.Sprintf("%d", callbackCounter)
	randGroupCallbacks[callbackId] = callback
	message := map[string]any{
		"key":        "math/genRandGroup",
		"callbackId": callbackId,
		"max":        fmt.Sprintf("%d", max),
	}
	str2, err2 := json.Marshal(message)
	if err2 != nil {
		core.LogData(err2.Error())
		return
	}
	fmt.Println(string(str2))
	core.Message(string(str2))
}

func FetchData[T any](topicId string, memberId string, id string, callback func(*T)) {
	key := topicId + "_" + memberId + "_" + id
	callbacks[key] = func(raw string) {
		str, errB64 := base64.StdEncoding.DecodeString(raw)
		if errB64 != nil {
			log.Println(errB64)
			return
		}
		pack := new(T)
		log.Println("................................")
		log.Println(string(str))
		log.Println("................................")
		err := json.Unmarshal(str, pack)
		if err != nil {
			core.LogData(err.Error())
			return
		}
		callback(pack)
	}
	message := map[string]any{
		"key":      "database/fetch",
		"topicId":  topicId,
		"memberId": memberId,
		"id":       id,
	}
	str2, err2 := json.Marshal(message)
	if err2 != nil {
		core.LogData(err2.Error())
		return
	}
	core.Message(string(str2))
}

func (g *Game) makeHakem(callback func()) {
	GenRand(playerCount, func(num int) {
		g.Hakem = g.Players[num].MemberId
		g.PrevWinner = g.Hakem
		callback()
	})
}

func (g *Game) makeHokm(user string, cardType string) (bool, error) {
	if g.Hakem == user {
		if cardTypes[cardType] {
			g.Hokm = cardType
			return true, nil
		} else {
			return false, errors.New("invalid card type")
		}
	} else {
		return false, errors.New("you are not hakem")
	}
}

func (g *Game) makeCardSet(callback func()) {
	slice := []string{}
	for key := range cardTypes {
		for j := 0; j < len(mapOfNameToIndex); j++ {
			option := fmt.Sprintf("%s-%d", key, j+2)
			slice = append(slice, option)
		}
	}
	GenRandGroup(len(slice), func(numbers []int) {
		for i, j := range numbers {
			slice[i], slice[j] = slice[j], slice[i]
		}
		eachUserCardCount := (len(cardTypes) * len(mapOfNameToIndex) / playerCount)
		for i := 0; i < playerCount; i++ {
			for j := 0; j < eachUserCardCount; j++ {
				game.MapOfOptions[slice[i*eachUserCardCount+j]] = game.Players[i].MemberId
			}
		}
		callback()
	})
}

func (g *Game) startNewSet() {
	g.History = append(g.History, &GameSet{Options: []string{}})
}

func (g *Game) act(userMemberId string, option string) (bool, string, func(), error) {
	if !strings.Contains(option, "-") {
		return false, "", nil, errors.New("action is invalid")
	}
	if len(g.History[len(g.History)-1].Options) == 0 {
		if userMemberId != g.PrevWinner {
			return false, "", nil, errors.New("you are not starter")
		}
	}
	var pos = (g.MembersIndex[userMemberId] + playerCount - g.MembersIndex[g.PrevWinner]) % playerCount
	if pos != (len(g.History[len(g.History)-1].Options)) {
		return false, "", nil, errors.New("not your turn")
	}
	if (len(g.History[len(g.History)-1].Options) > 0) && (strings.Split(option, "-")[0] != g.StageCard) {
		for key := range g.MapOfOptions {
			if (g.MapOfOptions[key] == userMemberId) && (strings.Split(key, "-")[1] == g.Hokm) {
				return false, "", nil, errors.New("action not available while you have hokm type cards")
			}
		}
	}
	if g.MapOfOptions[option] != userMemberId {
		return false, "", nil, errors.New("option not available")
	}
	if len(g.History[len(g.History)-1].Options) == 0 {
		g.StageCard = strings.Split(option, "-")[0]
	}
	if strings.Split(option, "-")[0] != g.StageCard {
		for key, val := range g.MapOfOptions {
			if val == userMemberId {
				if strings.Split(key, "-")[0] == g.StageCard {
					return false, "", nil, errors.New("you cant use non-stage card while you have stage card")
				}
			}
		}
	}
	g.MapOfOptions[option] = ""
	g.History[len(g.History)-1].Options = append(g.History[len(g.History)-1].Options, option)
	if len(g.History[len(g.History)-1].Options) == playerCount {
		winner := g.checkWinner()
		fmt.Println(winner)
		g.PrevWinner = winner
		fmt.Println("testing 1 .......................")
		fmt.Println(g.Teams)
		g.Teams[g.MembersToTeamsMap[winner]].Score++
		fmt.Println("testing 2 .......................")
		teamsList := []*models.Team{}
		for _, team := range g.Teams {
			teamsList = append(teamsList, team)
		}
		fmt.Println(teamsList)
		fmt.Println("testing 3 .......................")
		stageEnded := false
		var winnerTeam = ""
		if (teamsList[0].Score >= 7) && (teamsList[1].Score == 0) {
			teamsList[0].MainScore += 2
			winnerTeam = teamsList[0].Id
			stageEnded = true
		} else if (teamsList[1].Score >= 7) && (teamsList[0].Score == 0) {
			teamsList[1].MainScore += 2
			winnerTeam = teamsList[1].Id
			stageEnded = true
		} else if teamsList[0].Score >= 7 {
			teamsList[0].MainScore++
			winnerTeam = teamsList[0].Id
			stageEnded = true
		} else if teamsList[1].Score >= 7 {
			teamsList[1].MainScore++
			winnerTeam = teamsList[1].Id
			stageEnded = true
		}
		if stageEnded {
			var hakemTeam = g.Teams[g.MembersToTeamsMap[g.Hakem]].Id
			if hakemTeam != winnerTeam {
				hakemIndex := g.MembersIndex[g.Hakem]
				newHakemIndex := hakemIndex - 1
				if newHakemIndex < 0 {
					newHakemIndex = playerCount - 1
				}
				g.Hakem = g.Players[newHakemIndex].MemberId
				g.PrevWinner = g.Hakem
			}
			teamsList[0].Score = 0
			teamsList[1].Score = 0
			if (teamsList[0].MainScore == 3) || (teamsList[1].MainScore == 3) {
				if teamsList[0].MainScore > teamsList[1].MainScore {
					return true, "", func() {
						g.notifyStageResult(winner)
						g.notifyGameResult(teamsList[0].Id)
					}, nil
				} else {
					return true, "", func() {
						g.notifyStageResult(winner)
						g.notifyGameResult(teamsList[1].Id)
					}, nil
				}
			}
		}
		g.startNewSet()
		return true, winner, func() {
			g.notifyStageResult(winner)
		}, nil
	}
	return true, g.Players[(g.MembersIndex[g.PrevWinner]+pos+1)%playerCount].MemberId, nil, nil
}

func (g *Game) checkWinner() string {
	log.Println("line 1............................")
	options := g.History[len(g.History)-1].Options
	log.Println("line 2............................")
	mostValuable := ""
	log.Println("line 3............................")
	mostValuableUser := ""
	log.Println("line 4............................")
	prevWinnerIndex := g.MembersIndex[g.PrevWinner]
	log.Println("line 5............................")
	type extraRuler struct {
		memberId string
		opt      string
	}
	log.Println("line 6............................")
	extraRule := []extraRuler{}
	log.Println("line 7............................")
	for i, opt := range options {
		log.Println("line 8............................")
		if mostValuableUser == "" {
			mostValuable = opt
			log.Println("line 9............................")
			mostValuableUser = g.Players[(prevWinnerIndex+i)%playerCount].MemberId
			log.Println("line 10............................")
			continue
		}
		log.Println("line 11............................")
		if (strings.Split(opt, "-")[0] != g.StageCard) && (strings.Split(opt, "-")[0] == g.Hokm) {
			log.Println("line 12............................")
			extraRule = append(extraRule, extraRuler{memberId: g.Players[(prevWinnerIndex+i)%playerCount].MemberId, opt: opt})
			log.Println("line 13............................")
		}
		log.Println("line 14............................")
		if mapOfNameToIndex[strings.Split(mostValuable, "-")[1]] < mapOfNameToIndex[strings.Split(opt, "-")[1]] {
			log.Println("line 15............................")
			mostValuable = opt
			log.Println("line 16............................")
			mostValuableUser = g.Players[(prevWinnerIndex+i)%playerCount].MemberId
		}
	}
	log.Println("line 17............................")
	if len(extraRule) == 0 {
		log.Println("line 18............................")
		return mostValuableUser
	} else {
		log.Println("line 19............................")
		winner := ""
		opt := ""
		log.Println("line 20............................")
		for _, ruler := range extraRule {
			log.Println("line 21............................")
			if (opt == "") || (mapOfNameToIndex[strings.Split(opt, "-")[1]] < mapOfNameToIndex[strings.Split(ruler.opt, "-")[1]]) {
				log.Println("line 22............................")
				winner = ruler.memberId
				opt = ruler.opt
			}
		}
		log.Println("line 23............................")
		return winner
	}
}

func (g *Game) notifyGameResult(winner string) {
	message := map[string]any{
		"key": "topics/send",
		"value": map[string]any{
			"type":     "broadcast",
			"spaceId":  g.SpaceId,
			"topicId":  g.TopicId,
			"memberId": g.MemberId,
			"data": map[string]any{
				"type":   "gameResult",
				"winner": winner,
			},
		},
	}
	str, err := json.Marshal(message)
	if err != nil {
		core.LogData(err.Error())
	}
	core.Message(string(str))
}

func (g *Game) notifyStageResult(winner string) {
	message := map[string]any{
		"key": "topics/send",
		"value": map[string]any{
			"type":     "broadcast",
			"spaceId":  g.SpaceId,
			"topicId":  g.TopicId,
			"memberId": g.MemberId,
			"data": map[string]any{
				"type":   "stageResult",
				"winner": winner,
			},
		},
	}
	str, err := json.Marshal(message)
	if err != nil {
		core.LogData(err.Error())
	}
	core.Message(string(str))
}

func notifyGameCreation(g *Game) {
	type exportedGame struct {
		Hakem string   `json:"hakem"`
		Cards []string `json:"cards"`
	}
	for _, player := range g.Players {
		eg := exportedGame{Hakem: g.Hakem, Cards: []string{}}
		for card, owner := range g.MapOfOptions {
			if owner == player.MemberId {
				eg.Cards = append(eg.Cards, card)
			}
		}
		type data struct {
			Type     string       `json:"type"`
			Game     exportedGame `json:"game"`
			NextTurn string       `json:"nextTurn"`
		}
		var dataObj = data{
			Type: "gameCreation",
			Game: eg,
		}
		message := map[string]any{
			"key": "topics/send",
			"value": map[string]any{
				"type":     "single",
				"spaceId":  g.SpaceId,
				"topicId":  g.TopicId,
				"memberId": g.MemberId,
				"recvId":   player.MemberId,
				"data":     dataObj,
			},
		}
		str, err := json.Marshal(message)
		if err != nil {
			core.LogData(err.Error())
		}
		log.Println(string(str))
		core.Message(string(str))
	}
}

func askHokm(g *Game) {
	for _, player := range g.Players {
		if player.MemberId == g.Hakem {
			type data struct {
				Type string `json:"type"`
			}
			var dataObj = data{
				Type: "tellMeHokm",
			}
			message := map[string]any{
				"key": "topics/send",
				"value": map[string]any{
					"type":     "single",
					"spaceId":  g.SpaceId,
					"topicId":  g.TopicId,
					"memberId": g.MemberId,
					"recvId":   player.MemberId,
					"data":     dataObj,
				},
			}
			str, err := json.Marshal(message)
			if err != nil {
				core.LogData(err.Error())
			}
			core.Message(string(str))
			break
		}
	}
}

func notifyGameStart(g *Game, starter string) {
	message := map[string]any{
		"key": "topics/send",
		"value": map[string]any{
			"type":     "single",
			"spaceId":  g.SpaceId,
			"topicId":  g.TopicId,
			"memberId": g.MemberId,
			"recvId":   starter,
			"data": map[string]any{
				"type": "startGame",
			},
		},
	}
	str, err := json.Marshal(message)
	if err != nil {
		core.LogData(err.Error())
	}
	core.Message(string(str))
}

func notifyHokmSpecification(spaceId string, topicId string, memberId string, h string) {
	message := map[string]any{
		"key": "topics/send",
		"value": map[string]any{
			"type":     "broadcast",
			"spaceId":  spaceId,
			"topicId":  topicId,
			"memberId": memberId,
			"data": map[string]any{
				"type": "hokmSpecification",
				"hokm": h,
			},
		},
	}
	str, err := json.Marshal(message)
	if err != nil {
		core.LogData(err.Error())
	}
	core.Message(string(str))
}

func notifyGamePlay(spaceId string, topicId string, memberId string, playerMemberId, action string) {
	message := map[string]any{
		"key": "topics/send",
		"value": map[string]any{
			"type":     "broadcast",
			"spaceId":  spaceId,
			"topicId":  topicId,
			"memberId": memberId,
			"data": map[string]any{
				"type":           "gamePlay",
				"playerMemberId": playerMemberId,
				"action":         action,
			},
		},
	}
	str, err := json.Marshal(message)
	if err != nil {
		core.LogData(err.Error())
	}
	core.Message(string(str))
}

func OnAddToGroup(input any) any {

	data, err := json.Marshal(input)
	if err != nil {
		return map[string]any{"error": err.Error()}
	}

	core.LogData("i was added to group " + string(data))
	return map[string]any{}
}

func extractData[T any](data any) T {
	inp := new(T)
	str, err2 := json.Marshal(data)
	if err2 != nil {
		core.LogData(err2.Error())
		core.LogData("wrong input structure")
	}
	err3 := json.Unmarshal(str, inp)
	if err3 != nil {
		core.LogData(err3.Error())
		core.LogData("wrong input structure")
	}
	return *inp
}

func OnTopicSend(input models.Send) any {

	fmt.Println(input.Data)

	var data = map[string]any{}
	err := json.Unmarshal([]byte(input.Data), &data)
	if err != nil {
		return map[string]any{"error": err.Error()}
	}
	keyRaw, ok := data["type"]
	if !ok {
		core.LogData("no key exist")
		return map[string]any{}
	}
	key, ok2 := keyRaw.(string)
	if !ok2 {
		core.LogData("key is not string")
		return map[string]any{}
	}

	switch key {
	case "playGame":
		{
			act := data["action"].(string)
			g := game
			fmt.Println(g)
			success, nextTurn, runAfter, err := g.act(input.Member.Id, act)
			if !success {
				core.LogData(err.Error())
			} else {
				notifyGamePlay(input.Topic.SpaceId, input.Topic.Id, input.TargetMember.Id, input.Member.Id, act)
				if runAfter != nil {
					runAfter()
				}
				notifyGameStart(g, nextTurn)
			}
			break
		}
	case "createGame":
		{
			inp := extractData[inputs.CreateGameInput](data["value"])
			createGame(input.Topic.SpaceId, input.Topic.Id, input.TargetMember.Id, inp.Players, func() {
				notifyGameCreation(game)
				askHokm(game)
			})
			break
		}
	case "specifyHokm":
		{
			g := game
			g.makeHokm(input.Member.Id, data["hokm"].(string))
			notifyHokmSpecification(input.Topic.SpaceId, input.Topic.Id, input.TargetMember.Id, data["hokm"].(string))
			notifyGameStart(g, g.Hakem)
			break
		}
	}

	return map[string]any{}
}

func OnDbFetchRes(input map[string]any) any {

	id := input["id"].(string)
	topicId := input["topicId"].(string)
	memberId := input["memberId"].(string)
	data := input["data"].(string)

	key := topicId + "_" + memberId + "_" + id

	callback, ok := callbacks[key]
	if !ok {
		core.LogData("fetch request callback not found")
		return map[string]any{}
	}
	delete(callbacks, key)
	callback(data)

	return map[string]any{}
}

func OnMathRandGen(input map[string]any) any {

	callbackId := input["callbackId"].(string)
	number := input["number"].(string)

	num, err := strconv.ParseInt(number, 10, 64)
	if err != nil {
		fmt.Println(err)
	}

	callback, ok := randCallbacks[callbackId]
	if !ok {
		core.LogData("rand request callback not found")
		return map[string]any{}
	}
	delete(callbacks, callbackId)
	callback(int(num))

	return map[string]any{}
}

type RandGroup struct {
	CallbackId string   `json:"callbackId"`
	Numbers    []string `json:"numbers"`
}

func OnMathRandGroupGen(input RandGroup) any {

	fmt.Println("helllo----------------------------")

	callbackId := input.CallbackId
	numbers := input.Numbers

	numbersArr := []int{}

	for _, number := range numbers {
		num, err := strconv.ParseInt(number, 10, 64)
		if err != nil {
			fmt.Println(err)
		}
		numbersArr = append(numbersArr, int(num))
	}

	callback, ok := randGroupCallbacks[callbackId]
	if !ok {
		core.LogData("rand request callback not found")
		return map[string]any{}
	}
	delete(callbacks, callbackId)
	callback(numbersArr)

	return map[string]any{}
}

func CreateService() {
	core.AddMethod("spaces/addMemberMe", OnAddToGroup)
	core.AddMethod("response/database/fetch", OnDbFetchRes)
	core.AddMethod("response/math/genRandGroup", OnMathRandGroupGen)
	core.AddMethod("response/math/genRand", OnMathRandGen)
	core.AddMethod("topics/send", OnTopicSend)
}
