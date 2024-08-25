package security

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"encoding/pem"
	"fmt"
	"os"
	modulelogger "sigma/sigma/core/module/logger"
	"sigma/sigma/layer1/adapters"
	models "sigma/sigma/layer1/model"
	"sigma/sigma/layer1/tools/signaler"
	"sigma/sigma/utils/crypto"
	"sigma/sigma/utils/vaidate"

	"strings"

	"github.com/gofiber/fiber/v2"
)

type Security struct {
	logger      *modulelogger.Logger
	storage     adapters.IStorage
	cache       adapters.ICache
	signaler    *signaler.Signaler
	storageRoot string
	keys        map[string][][]byte
}

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

type Location struct {
	SpaceId  string
	TopicId  string
	MemberId string
}

const memberTemplate = "member::%s::%s"
const cityTemplate = "city::%s"
const keysFolderName = "keys"

func (sm *Security) LoadKeys() {
	files, err := os.ReadDir(sm.storageRoot + "/keys")
	if err != nil {
		sm.logger.Println(err)
	}
	for _, file := range files {
		if file.IsDir() {
			priKey, err1 := os.ReadFile(sm.storageRoot + "/" + keysFolderName + "/" + file.Name() + "/private.pem")
			if err1 != nil {
				sm.logger.Println(err1)
				continue
			}
			pubKey, err2 := os.ReadFile(sm.storageRoot + "/" + keysFolderName + "/" + file.Name() + "/public.pem")
			if err2 != nil {
				sm.logger.Println(err2)
				continue
			}
			sm.keys[file.Name()] = [][]byte{priKey, pubKey}
		}
	}
	if sm.FetchKeyPair("server_key") == nil {
		sm.GenerateSecureKeyPair("server_key")
	}
}

func (sm *Security) GenerateSecureKeyPair(tag string) {
	var priKey, pubKey = crypto.SecureKeyPairs(sm.storageRoot + "/" + keysFolderName + "/" + tag)
	sm.keys[tag] = [][]byte{priKey, pubKey}
}

func (sm *Security) FetchKeyPair(tag string) [][]byte {
	return sm.keys[tag]
}

func (sm *Security) Encrypt(tag string, plainText string) string {
	publicKeyPEM := sm.keys[tag][1]
	publicKeyBlock, _ := pem.Decode(publicKeyPEM)
	publicKey, err := x509.ParsePKIXPublicKey(publicKeyBlock.Bytes)
	if err != nil {
		sm.logger.Println(err)
		return ""
	}
	ciphertext, err := rsa.EncryptPKCS1v15(rand.Reader, publicKey.(*rsa.PublicKey), []byte(plainText))
	if err != nil {
		sm.logger.Println(err)
		return ""
	}
	return fmt.Sprintf("%x", ciphertext)
}

func (sm *Security) Decrypt(tag string, cipherText string) string {
	privateKeyPEM := sm.keys[tag][0]
	privateKeyBlock, _ := pem.Decode(privateKeyPEM)
	privateKey, err := x509.ParsePKCS1PrivateKey(privateKeyBlock.Bytes)
	if err != nil {
		sm.logger.Println(err)
		return ""
	}
	plaintext, err := rsa.DecryptPKCS1v15(rand.Reader, privateKey, []byte(cipherText))
	if err != nil {
		sm.logger.Println(err)
		return ""
	}
	return string(plaintext)
}

func (sm *Security) AuthWithToken(token string) (string, string, bool) {
	var auth = sm.cache.Get("auth::" + token)
	var userId = ""
	var userType = ""
	if auth != "" {
		var dataParts = strings.Split(auth, "/")
		userId = dataParts[1]
		userType = dataParts[0]
	}
	var isGod = sm.cache.Get("god::" + userId)
	return userId, userType, (isGod == "true")
}

func (sm *Security) Authenticate(headers map[string][]string, ctx *fiber.Ctx) (string, string, string) {
	if headers["Token"] == nil {
		return "", "", ""
	}
	var token = string(headers["Token"][0])
	var userId, userType, _ = sm.AuthWithToken(token)
	if userId == "" {
		_ = ctx.Status(fiber.ErrForbidden.Code).JSON(models.BuildErrorJson("token authentication failed"))
		return "", "", ""
	} else {
		return userId, userType, token
	}
}

func (sm *Security) AuthorizeFedHumanWithProcessed(userId string, spaceId string, topicId string) Location {
	if spaceId == "" {
		return Location{SpaceId: "", TopicId: ""}
	}
	var memberData = sm.cache.Get(fmt.Sprintf(memberTemplate, spaceId, userId))
	var cityData = sm.cache.Get(fmt.Sprintf(cityTemplate, topicId))
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
	if spaceId == "" && topicId == "" {
		return Location{SpaceId: "", TopicId: ""}
	}
	if spaceId == "" {
		if topicId != "" {
			var cityData = sm.cache.Get(fmt.Sprintf(cityTemplate, topicId))
			if cityData == "" {
				return Location{SpaceId: "", TopicId: ""}
			}
			var memberData = sm.cache.Get(fmt.Sprintf(memberTemplate, cityData, userId))
			if memberData == "" {
				return Location{SpaceId: "", TopicId: ""}
			}
			return Location{SpaceId: cityData, TopicId: topicId}	
		}
	}
	var memberData = sm.cache.Get(fmt.Sprintf(memberTemplate, spaceId, userId))
	var cityData = sm.cache.Get(fmt.Sprintf(cityTemplate, topicId))
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
	var memberData = sm.cache.Get(fmt.Sprintf(memberTemplate, spaceId, userId))
	var cityData = sm.cache.Get(fmt.Sprintf(cityTemplate, topicId))
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
		sm.logger.Println(models.BuildErrorJson("worker id is empty"))
		return Location{SpaceId: "", TopicId: ""}
	}
	var workerData = sm.cache.Get(fmt.Sprintf("worker::%s", wid))
	if workerData != "" {
		var dataParts = strings.Split(workerData, "/")
		var topicId = dataParts[0]
		var machId = dataParts[1]
		if machId != userId {
			return Location{SpaceId: "", TopicId: ""}
		}
		var spaceId = sm.cache.Get(fmt.Sprintf(cityTemplate, topicId))
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
	var workerData = sm.cache.Get(fmt.Sprintf("worker::%s", wid))
	if workerData != "" {
		var dataParts = strings.Split(workerData, "/")
		var topicId = dataParts[0]
		var machId = dataParts[1]
		if machId != userId {
			return Location{SpaceId: "", TopicId: ""}
		}
		var spaceId = sm.cache.Get(fmt.Sprintf(cityTemplate, topicId))
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

func New(storageRoot string, storage adapters.IStorage, cache adapters.ICache, signaler *signaler.Signaler) *Security {
	vaidate.LoadValidationSystem()
	s := &Security{
		storage:     storage,
		cache:       cache,
		signaler:    signaler,
		storageRoot: storageRoot,
		keys:        make(map[string][][]byte),
	}
	s.LoadKeys()
	return s
}
