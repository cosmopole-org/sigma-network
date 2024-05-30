package security

import (
	"fmt"
	"sigma/main/core/managers/memory"
	"sigma/main/core/utils"
	"strings"

	"github.com/gofiber/fiber/v2"
)

type AuthHolder struct {
	Token string `json:"token"`
}

type LastPos struct {
	UserId   int64
	UserType int32
	SpaceId  int64
	TopicId  int64
	WorkerId int64
}

func (sm *SecurityManager) AuthWithToken(token string) (string, string) {
	var auth = sm.memManager.Get("auth::" + token)
	var userId string = ""
	var userType string = ""
	if auth != "" {
		var dataParts = strings.Split(auth, "/")
		userId = dataParts[1]
		userType = dataParts[0]
	}
	return userId, userType
}

func (sm *SecurityManager) Authenticate(headers map[string][]string, ctx *fiber.Ctx) (string, string, string) {
	if headers["Token"] == nil {
		return "", "", ""
	}
	var token = string(headers["Token"][0])
	var userId, userType = sm.AuthWithToken(token)
	if userId == "" {
		ctx.Status(fiber.ErrForbidden.Code).JSON(utils.BuildErrorJson("token authentication failed"))
		return "", "", ""
	} else {
		return userId, userType, token
	}
}

type Location struct {
	SpaceId  string
	TopicId  string
	MemberId string
}

var memberTemplate = "member::%s::%s"
var cityTemplate = "city::%s"

func (sm *SecurityManager) AuthorizeFedHumanWithProcessed(userId string, spaceId string, topicId string) Location {
	if spaceId == "" {
		return Location{SpaceId: "", TopicId: ""}
	}
	var memberData = sm.memManager.Get(fmt.Sprintf(memberTemplate, spaceId, userId))
	var cityData = sm.memManager.Get(fmt.Sprintf(cityTemplate, topicId))
	if memberData != "" {
		if cityData != "" && cityData == spaceId {
			return Location{SpaceId: spaceId, TopicId: topicId}
		} else {
			return Location{SpaceId: spaceId, TopicId: ""}
		}
	} else {
		return Location{SpaceId: "", TopicId: ""}
	}
}

func (sm *SecurityManager) AuthorizeHumanWithProcessed(token string, userId string, spaceId string, topicId string) Location {
	if spaceId == "" {
		return Location{SpaceId: "", TopicId: ""}
	}
	var memberData = sm.memManager.Get(fmt.Sprintf(memberTemplate, spaceId, userId))
	var cityData = sm.memManager.Get(fmt.Sprintf(cityTemplate, topicId))
	if memberData != "" {
		if cityData != "" && cityData == spaceId {
			return Location{SpaceId: spaceId, TopicId: topicId}
		} else {
			return Location{SpaceId: spaceId, TopicId: ""}
		}
	} else {
		return Location{SpaceId: "", TopicId: ""}
	}
}

func (sm *SecurityManager) AuthorizeHuman(token string, userId string, headers map[string][]string) Location {
	if headers["Space_id"] == nil {
		return Location{SpaceId: "", TopicId: ""}
	}
	var spaceId = string(headers["Space_id"][0])
	var topicId string = ""
	if headers["Topic_id"] != nil {
		topicId = string(headers["Topic_id"][0])
	}
	var memberData = sm.memManager.Get(fmt.Sprintf(memberTemplate, spaceId, userId))
	var cityData = sm.memManager.Get(fmt.Sprintf("city::%s", topicId))
	if memberData != "" {
		if cityData != "" && cityData == spaceId {
			return Location{SpaceId: spaceId, TopicId: topicId}
		} else {
			return Location{SpaceId: spaceId, TopicId: ""}
		}
	} else {
		return Location{SpaceId: "", TopicId: ""}
	}
}

func (sm *SecurityManager) AuthorizeMachineWithProcessed(token string, userId string, wid string) Location {
	if wid == "" {
		utils.Log(5, utils.BuildErrorJson("worker id is empty"))
		return Location{SpaceId: "", TopicId: ""}
	}
	var workerData = sm.memManager.Get(fmt.Sprintf("worker::%s", wid))
	if workerData != "" {
		var dataParts = strings.Split(workerData, "/")
		var topicId = dataParts[0]
		var machId = dataParts[1]
		if machId != userId {
			return Location{SpaceId: "", TopicId: ""}
		}
		var spaceId = sm.memManager.Get(fmt.Sprintf("city::%s", topicId))
		if spaceId == "" {
			return Location{SpaceId: "", TopicId: ""}
		}
		return Location{SpaceId: spaceId, TopicId: topicId, MemberId: wid}
	} else {
		return Location{SpaceId: "", TopicId: ""}
	}
}

func (sm *SecurityManager) AuthorizeMachine(token string, userId string, headers map[string][]string) Location {
	wid := string(headers["worker_id"][0])
	var workerData = sm.memManager.Get(fmt.Sprintf("worker::%s", wid))
	if workerData != "" {
		var dataParts = strings.Split(workerData, "/")
		var topicId = dataParts[0]
		var machId = dataParts[1]
		if machId != userId {
			return Location{SpaceId: "", TopicId: ""}
		}
		var spaceId = sm.memManager.Get(fmt.Sprintf("city::%s", topicId))
		if spaceId == "" {
			return Location{SpaceId: "", TopicId: ""}
		}
		return Location{SpaceId: spaceId, TopicId: topicId, MemberId: wid}
	} else {
		return Location{SpaceId: "", TopicId: ""}
	}
}

func (sm *SecurityManager) HandleLocation(token string, userId string, userType string, headers map[string][]string) Location {
	var location Location
	if userType == "human" {
		location = sm.AuthorizeHuman(token, userId, headers)
	} else {
		location = sm.AuthorizeMachine(token, userId, headers)
	}
	return location
}

func (sm *SecurityManager) HandleLocationWithProcessed(token string, userId string, userType string, spaceId string, topicId string, workerId string) Location {
	var location Location
	if userType == "human" {
		location = sm.AuthorizeHumanWithProcessed(token, userId, spaceId, topicId)
	} else {
		location = sm.AuthorizeMachineWithProcessed(token, userId, workerId)
	}
	return location
}

type SecurityManager struct {
	memManager *memory.Memory
}

func New(memManager *memory.Memory) *SecurityManager {
	return &SecurityManager{memManager: memManager}
}
