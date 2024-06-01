package shell_federation

import (
	"encoding/json"
	"sigma/storage/core/models"
	outputs_invites "sigma/storage/core/outputs/invites"
	outputs_spaces "sigma/storage/core/outputs/spaces"
	"sigma/storage/core/runtime"
	"sigma/storage/core/tools/signaler"
	"sigma/storage/core/utils"
	storage_manager "sigma/storage/shell/tools/storage"
	"strings"

	"github.com/gofiber/fiber/v2"
)

type FedNet struct {
	ipToHostMap map[string]string
	hostToIpMap map[string]string
	app         *runtime.App
	stoManager  *storage_manager.StorageManager
	sigManager  *signaler.Signaler
	fed         bool
}

func (fed *FedNet) LoadFedNet(f *fiber.App) {
	if fed.fed {
		f.Post("/api/federation", func(c *fiber.Ctx) error {
			var pack models.OriginPacket
			c.BodyParser(&pack)
			ip := utils.FromRequest(c.Context())
			hostName, ok := fed.ipToHostMap[ip]
			utils.Log(5, "packet from ip: [", ip, "] and hostname: [", hostName, "]")
			if ok {
				fed.HandlePacket(hostName, pack)
				return c.Status(fiber.StatusOK).JSON(models.ResponseSimpleMessage{Message: "federation packet received"})
			} else {
				utils.Log(5, "hostname not known")
				return c.Status(fiber.StatusOK).JSON(models.ResponseSimpleMessage{Message: "hostname not known"})
			}
		})
	}
}

func (fed *FedNet) HandlePacket(channelId string, payload models.OriginPacket) {
	if fed.fed {
		if payload.IsResponse {
			dataArr := strings.Split(payload.Key, " ")
			if dataArr[0] == "/invites/accept" || dataArr[0] == "/spaces/join" {
				var member *models.Member
				if dataArr[0] == "/invites/accept" {
					var memberRes outputs_invites.AcceptOutput
					err2 := json.Unmarshal([]byte(payload.Data), &memberRes)
					if err2 != nil {
						utils.Log(5, err2)
						return
					}
					member = &memberRes.Member
				} else if dataArr[0] == "/spaces/join" {
					var memberRes outputs_spaces.JoinOutput
					err2 := json.Unmarshal([]byte(payload.Data), &memberRes)
					if err2 != nil {
						utils.Log(5, err2)
						return
					}
					member = &memberRes.Member
				}
				if member != nil {
					member.Id = utils.SecureUniqueId(fed.app.AppId) + "_" + channelId
					fed.stoManager.CreateTrx().Create(member).Commit()
					fed.sigManager.JoinGroup(member.SpaceId, member.UserId)
				}
			}
			fed.sigManager.SignalUser(payload.Key, payload.RequestId, payload.UserId, payload.Data, true)
		} else {
			dataArr := strings.Split(payload.Key, " ")
			if len(dataArr) > 0 && (dataArr[0] == "update") {
				fed.sigManager.SignalUser(payload.Key[len("update "):], "", payload.UserId, payload.Data, true)
			} else if len(dataArr) > 0 && (dataArr[0] == "groupUpdate") {
				fed.sigManager.SignalGroup(payload.Key[len("groupUpdate "):], payload.SpaceId, payload.Data, true, payload.Exceptions)
			} else {
				action := fed.app.Services.GetAction(payload.Key)
				check := action.Check
				location := fed.app.Tools.Security().AuthorizeFedHumanWithProcessed(payload.UserId, payload.SpaceId, payload.TopicId)
				if check.Space && location.SpaceId == "" {
					errPack, err2 := json.Marshal(utils.BuildErrorJson("access denied"))
					if err2 == nil {
						fed.SendInFederation(channelId, models.OriginPacket{IsResponse: true, Key: payload.Key, RequestId: payload.RequestId, Data: string(errPack), UserId: payload.UserId})
					}
					return
				}
				member := models.Member{}
				fed.stoManager.CreateTrx().Where("space_id = ?", location.SpaceId).Where("user_id = ?", payload.UserId).First(&member).Commit()
				_, res, err := action.ProcessFederative(fed.app.GenerateControl(), payload.Data, models.Info{
					User:   models.User{Id: payload.UserId},
					Member: member,
				})
				if err != nil {
					utils.Log(5, err)
					errPack, err2 := json.Marshal(utils.BuildErrorJson(err.Error()))
					if err2 == nil {
						fed.SendInFederation(channelId, models.OriginPacket{IsResponse: true, Key: payload.Key, RequestId: payload.RequestId, Data: string(errPack), UserId: payload.UserId})
					}
					return
				}
				packet, err3 := json.Marshal(res)
				if err3 != nil {
					utils.Log(5, err3)
					errPack, err2 := json.Marshal(utils.BuildErrorJson(err3.Error()))
					if err2 == nil {
						fed.SendInFederation(channelId, models.OriginPacket{IsResponse: true, Key: payload.Key, RequestId: payload.RequestId, Data: string(errPack), UserId: payload.UserId})
					}
					return
				}
				fed.SendInFederation(channelId, models.OriginPacket{IsResponse: true, Key: payload.Key, RequestId: payload.RequestId, Data: string(packet), UserId: payload.UserId})
			}
		}
	}
}

func (fed *FedNet) SendInFederation(destOrg string, packet models.OriginPacket) {
	if fed.fed {
		_, ok := fed.hostToIpMap[destOrg]
		if ok {
			statusCode, _, err := fiber.Post("https://" + destOrg + "/api/federation").JSON(packet).Bytes()
			if err != nil {
				utils.Log(5, "could not send: status: %d error: %v", statusCode, err)
				utils.Log(5)
			} else {
				utils.Log(5, "packet sent successfully. status: ", statusCode)
			}
		} else {
			utils.Log(5, "state org not found")
		}
	}
}

func (fed *FedNet) Setup(sc *runtime.App, storage *storage_manager.StorageManager, signaler *signaler.Signaler, ip2host map[string]string, host2ip map[string]string) {
	fed.app = sc
	fed.stoManager = storage
	fed.sigManager = signaler
	fed.ipToHostMap = ip2host
	fed.hostToIpMap = host2ip
	fed.fed = true
}

func CreateFederation() *FedNet {
	return &FedNet{}
}
