package types

import (
	"fmt"
	"sigma/map/core/utils"
	"strconv"
	"strings"

	"github.com/valyala/fasthttp"
)

type AuthHolder struct {
	Token string `json:"token"`
}

type LastPos struct {
	UserId   int64
	UserType int32
	TowerId  int64
	RoomId   int64
	WorkerId int64
}

var authCache = map[string]*LastPos{}

func AuthWithToken(app *App, token string) (int64, int32) {
	var ac = authCache[token]
	if ac != nil {
		return ac.UserId, ac.UserType
	}
	var auth = app.Memory.Get("auth::" + token)
	var userId int64 = 0
	var userType int32 = 0
	if auth != "" {
		var dataParts = strings.Split(auth, "/")
		i, err := strconv.ParseInt(dataParts[1], 10, 64)
		if err != nil {
			fmt.Println(err)
		} else {
			userId = i
		}
		if dataParts[0] == "human" {
			userType = 1
		} else if dataParts[0] == "machine" {
			userType = 2
		}
	}
	authCache[token] = &LastPos{UserId: userId, UserType: userType, TowerId: 0, RoomId: 0, WorkerId: 0}
	return userId, userType
}

func Authenticate(app *App, packet *WebPacket) (int64, string, string) {
	var token = string(packet.GetHeader("token"))
	var id, creatureType = AuthWithToken(app, token)
	if id == 0 {
		packet.AnswerWithJson(fasthttp.StatusForbidden, map[string]string{}, utils.BuildErrorJson("token authentication failed"))
		return 0, "", ""
	} else {
		if creatureType == 1 {
			return id, "human", token
		} else if creatureType == 2 {
			return id, "machine", token
		}
		return 0, "", ""
	}
}

type Location struct {
	TowerId  int64
	RoomId   int64
	WorkerId int64
}

func AuthorizeHuman(app *App, token string, humanId int64, packet *WebPacket) Location {
	var towerId = string(packet.GetHeader("tower_id"))
	tid, err1 := strconv.ParseInt(towerId, 10, 64)
	if err1 != nil {
		fmt.Println(err1)
		return Location{TowerId: 0, RoomId: 0}
	}
	rid, err1 := strconv.ParseInt(string(packet.GetHeader("room_id")), 10, 64)
	if err1 != nil {
		fmt.Println(err1)
	}
	var ac = authCache[token]
	if ac != nil && ac.TowerId == tid && ac.RoomId == rid {
		return Location{TowerId: tid, RoomId: rid}
	}
	var memberData = app.Memory.Get(fmt.Sprintf("member::%d::%d", tid, humanId))
	var cityData = app.Memory.Get(fmt.Sprintf("city::%d", rid))
	if memberData != "" {
		if cityData != "" && cityData == towerId {
			authCache[token].TowerId = tid
			authCache[token].RoomId = rid
			return Location{TowerId: tid, RoomId: rid}
		} else {
			authCache[token].TowerId = tid
			return Location{TowerId: tid, RoomId: 0}
		}
	} else {
		return Location{TowerId: 0, RoomId: 0}
	}
}

func AuthorizeMachine(app *App, token string, machineId int64, packet *WebPacket) Location {
	wid, err1 := strconv.ParseInt(string(packet.GetHeader("worker_id")), 10, 64)
	if err1 != nil {
		fmt.Println(err1)
		return Location{TowerId: 0, RoomId: 0}
	}
	var ac = authCache[token]
	if ac != nil && ac.WorkerId == wid {
		return Location{TowerId: ac.TowerId, RoomId: ac.RoomId}
	}
	var workerData = app.Memory.Get(fmt.Sprintf("worker::%d", wid))
	if workerData != "" {
		var dataParts = strings.Split(workerData, "/")
		var rid = dataParts[0]
		roomId, err2 := strconv.ParseInt(rid, 10, 64)
		if err2 != nil {
			fmt.Println(err2)
			return Location{TowerId: 0, RoomId: 0}
		}
		var mid = dataParts[1]
		machId, err3 := strconv.ParseInt(mid, 10, 64)
		if err3 != nil {
			fmt.Println(err3)
			return Location{TowerId: 0, RoomId: 0}
		}
		if machId != machineId {
			return Location{TowerId: 0, RoomId: 0}
		}
		var cityData = app.Memory.Get(fmt.Sprintf("city::%s", rid))
		if cityData == "" {
			return Location{TowerId: 0, RoomId: 0}
		}
		towerId, err4 := strconv.ParseInt(cityData, 10, 64)
		if err4 != nil {
			fmt.Println(err4)
			return Location{TowerId: 0, RoomId: 0}
		}
		authCache[token].TowerId = towerId
		authCache[token].RoomId = roomId
		authCache[token].WorkerId = wid
		return Location{TowerId: towerId, RoomId: roomId, WorkerId: wid}
	} else {
		return Location{TowerId: 0, RoomId: 0}
	}
}

func HandleLocation(app *App, token string, userId int64, userType string, packet *WebPacket) Location {
	var location Location
	if userType == "human" {
		location = AuthorizeHuman(app, token, userId, packet)
	} else {
		location = AuthorizeMachine(app, token, userId, packet)
	}
	return location
}
