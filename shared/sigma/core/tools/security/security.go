package security

import (
	"fmt"
	"sigma/main/core/models"
	"sigma/main/core/tools/cache"
	"sigma/main/core/tools/crypto"
	"sigma/main/core/tools/signaler"
	"sigma/main/core/tools/storage"
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

func (sm *Security) LoadKeys() {
	if sm.cryptoManager.FetchKeyPair("server_key") == nil {
		sm.cryptoManager.GenerateSecureKeyPair("server_key")
	}
}

func (sm *Security) LoadAccess() {
	var members []models.Member
	sm.storageManager.Find(&members)
	for _, member := range members {
		sm.sigManager.JoinGroup(member.SpaceId, member.UserId)
	}
}

func (sm *Security) AuthWithToken(token string) (string, string) {
	var auth = sm.cacheManager.Get("auth::" + token)
	var userId string = ""
	var userType string = ""
	if auth != "" {
		var dataParts = strings.Split(auth, "/")
		userId = dataParts[1]
		userType = dataParts[0]
	}
	return userId, userType
}

func (sm *Security) Authenticate(headers map[string][]string, ctx *fiber.Ctx) (string, string, string) {
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

func (sm *Security) AuthorizeFedHumanWithProcessed(userId string, spaceId string, topicId string) Location {
	if spaceId == "" {
		return Location{SpaceId: "", TopicId: ""}
	}
	var memberData = sm.cacheManager.Get(fmt.Sprintf(memberTemplate, spaceId, userId))
	var cityData = sm.cacheManager.Get(fmt.Sprintf(cityTemplate, topicId))
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

func (sm *Security) AuthorizeHumanWithProcessed(token string, userId string, spaceId string, topicId string) Location {
	if spaceId == "" {
		return Location{SpaceId: "", TopicId: ""}
	}
	var memberData = sm.cacheManager.Get(fmt.Sprintf(memberTemplate, spaceId, userId))
	var cityData = sm.cacheManager.Get(fmt.Sprintf(cityTemplate, topicId))
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

func (sm *Security) AuthorizeHuman(token string, userId string, headers map[string][]string) Location {
	if headers["Space_id"] == nil {
		return Location{SpaceId: "", TopicId: ""}
	}
	var spaceId = string(headers["Space_id"][0])
	var topicId string = ""
	if headers["Topic_id"] != nil {
		topicId = string(headers["Topic_id"][0])
	}
	var memberData = sm.cacheManager.Get(fmt.Sprintf(memberTemplate, spaceId, userId))
	var cityData = sm.cacheManager.Get(fmt.Sprintf("city::%s", topicId))
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

func (sm *Security) AuthorizeMachineWithProcessed(token string, userId string, wid string) Location {
	if wid == "" {
		utils.Log(5, utils.BuildErrorJson("worker id is empty"))
		return Location{SpaceId: "", TopicId: ""}
	}
	var workerData = sm.cacheManager.Get(fmt.Sprintf("worker::%s", wid))
	if workerData != "" {
		var dataParts = strings.Split(workerData, "/")
		var topicId = dataParts[0]
		var machId = dataParts[1]
		if machId != userId {
			return Location{SpaceId: "", TopicId: ""}
		}
		var spaceId = sm.cacheManager.Get(fmt.Sprintf("city::%s", topicId))
		if spaceId == "" {
			return Location{SpaceId: "", TopicId: ""}
		}
		return Location{SpaceId: spaceId, TopicId: topicId, MemberId: wid}
	} else {
		return Location{SpaceId: "", TopicId: ""}
	}
}

func (sm *Security) AuthorizeMachine(token string, userId string, headers map[string][]string) Location {
	wid := string(headers["worker_id"][0])
	var workerData = sm.cacheManager.Get(fmt.Sprintf("worker::%s", wid))
	if workerData != "" {
		var dataParts = strings.Split(workerData, "/")
		var topicId = dataParts[0]
		var machId = dataParts[1]
		if machId != userId {
			return Location{SpaceId: "", TopicId: ""}
		}
		var spaceId = sm.cacheManager.Get(fmt.Sprintf("city::%s", topicId))
		if spaceId == "" {
			return Location{SpaceId: "", TopicId: ""}
		}
		return Location{SpaceId: spaceId, TopicId: topicId, MemberId: wid}
	} else {
		return Location{SpaceId: "", TopicId: ""}
	}
}

func (sm *Security) HandleLocation(token string, userId string, userType string, headers map[string][]string) Location {
	var location Location
	if userType == "human" {
		location = sm.AuthorizeHuman(token, userId, headers)
	} else {
		location = sm.AuthorizeMachine(token, userId, headers)
	}
	return location
}

func (sm *Security) HandleLocationWithProcessed(token string, userId string, userType string, spaceId string, topicId string, workerId string) Location {
	var location Location
	if userType == "human" {
		location = sm.AuthorizeHumanWithProcessed(token, userId, spaceId, topicId)
	} else {
		location = sm.AuthorizeMachineWithProcessed(token, userId, workerId)
	}
	return location
}

type Security struct {
	storageManager storage.IStorage
	cacheManager   cache.ICache
	cryptoManager  *crypto.Crypto
	sigManager     *signaler.Signaler
}

func New(storageManager storage.IStorage, cacheManager cache.ICache, cryptoManager *crypto.Crypto, sigManager *signaler.Signaler) *Security {
	return &Security{storageManager: storageManager, cacheManager: cacheManager, cryptoManager: cryptoManager, sigManager: sigManager}
}
