package modules

import (
	"fmt"
	"sigma/admin/core/utils"
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v2"
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

func Authenticate(app *App, headers map[string][]string, ctx *fiber.Ctx) (int64, string, string) {
	if headers["Token"] == nil {
		return 0, "", ""
	}
	var token = string(headers["Token"][0])
	var id, creatureType = AuthWithToken(app, token)
	if id == 0 {
		ctx.Status(fiber.ErrForbidden.Code).JSON(utils.BuildErrorJson("token authentication failed"))
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

func AuthorizeHumanWithProcessed(app *App, token string, humanId int64, towerId int64, roomId int64) Location {
	if towerId == 0 {
		return Location{TowerId: 0, RoomId: 0}
	}
	var ac = authCache[token]
	if ac != nil && ac.TowerId == towerId && ac.RoomId == roomId {
		return Location{TowerId: towerId, RoomId: roomId}
	}
	var towerIdStr = fmt.Sprintf("%d", towerId)
	var memberData = app.Memory.Get(fmt.Sprintf("member::%d::%d", towerId, humanId))
	var cityData = app.Memory.Get(fmt.Sprintf("city::%d", roomId))
	if memberData != "" {
		if cityData != "" && cityData == towerIdStr {
			authCache[token].TowerId = towerId
			authCache[token].RoomId = roomId
			return Location{TowerId: towerId, RoomId: roomId}
		} else {
			authCache[token].TowerId = towerId
			return Location{TowerId: towerId, RoomId: 0}
		}
	} else {
		return Location{TowerId: 0, RoomId: 0}
	}
}

func AuthorizeHuman(app *App, token string, humanId int64, headers map[string][]string) Location {
	if headers["Tower_id"] == nil {
		return Location{TowerId: 0, RoomId: 0}
	}
	var towerId = string(headers["Tower_id"][0])
	tid, err1 := strconv.ParseInt(towerId, 10, 64)
	if err1 != nil {
		fmt.Println(err1)
		return Location{TowerId: 0, RoomId: 0}
	}
	var roid int64 = 0
	if headers["Room_id"] != nil {
		rid, err1 := strconv.ParseInt(string(headers["Room_id"][0]), 10, 64)
		if err1 != nil {
			fmt.Println(err1)
		}
		roid = rid
	}
	var ac = authCache[token]
	if ac != nil && ac.TowerId == tid && ac.RoomId == roid {
		return Location{TowerId: tid, RoomId: roid}
	}
	var memberData = app.Memory.Get(fmt.Sprintf("member::%d::%d", tid, humanId))
	var cityData = app.Memory.Get(fmt.Sprintf("city::%d", roid))
	if memberData != "" {
		if cityData != "" && cityData == towerId {
			authCache[token].TowerId = tid
			authCache[token].RoomId = roid
			return Location{TowerId: tid, RoomId: roid}
		} else {
			authCache[token].TowerId = tid
			return Location{TowerId: tid, RoomId: 0}
		}
	} else {
		return Location{TowerId: 0, RoomId: 0}
	}
}

func AuthorizeMachineWithProcessed(app *App, token string, machineId int64, wid int64) Location {
	if wid > 0 {
		fmt.Println(utils.BuildErrorJson("worker id is empty"))
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

func AuthorizeMachine(app *App, token string, machineId int64, headers map[string][]string) Location {
	wid, err1 := strconv.ParseInt(string(headers["worker_id"][0]), 10, 64)
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

func HandleLocation(app *App, token string, userId int64, userType string, headers map[string][]string) Location {
	var location Location
	if userType == "human" {
		location = AuthorizeHuman(app, token, userId, headers)
	} else {
		location = AuthorizeMachine(app, token, userId, headers)
	}
	return location
}

func HandleLocationWithProcessed(app *App, token string, userId int64, userType string, towerId int64, roomId int64, workerId int64) Location {
	var location Location
	if userType == "human" {
		location = AuthorizeHumanWithProcessed(app, token, userId, towerId, roomId)
	} else {
		location = AuthorizeMachineWithProcessed(app, token, userId, workerId)
	}
	return location
}
