package shell_federation

import (
	"context"
	"encoding/json"
	"sigma/admin/core/modules"
	"sigma/admin/core/utils"
	"strings"

	pb "sigma/admin/core/models/grpc"

	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
)

type FedNet struct {
	ipToHostMap map[string]string
	hostToIpMap map[string]string
	sigmaCore   *modules.App
	fed         bool
}

func (fed *FedNet) LoadFedNet(f *fiber.App) {
	f.Post("/api/federation", func(c *fiber.Ctx) error {
		var pack modules.OriginPacket
		c.BodyParser(&pack)
		ip := utils.FromRequest(c.Context())
		hostName, ok := fed.ipToHostMap[ip]
		utils.Log(logrus.DebugLevel, "packet from ip: [", ip, "] and hostname: [", hostName, "]")
		if ok {
			fed.HandlePacket(hostName, pack)
			return c.Status(fiber.StatusOK).JSON(modules.ResponseSimpleMessage{Message: "federation packet received"})
		} else {
			utils.Log(logrus.DebugLevel, "hostname not known")
			return c.Status(fiber.StatusOK).JSON(modules.ResponseSimpleMessage{Message: "hostname not known"})
		}
	})
}

func (fed *FedNet) HandlePacket(channelId string, payload modules.OriginPacket) {
	if payload.IsResponse {
		dataArr := strings.Split(payload.Key, " ")
		if dataArr[0] == "/invites/accept" || dataArr[0] == "/towers/join" {
			var member *pb.Member
			if dataArr[0] == "/invites/accept" {
				var memberRes pb.InviteAcceptOutput
				err2 := json.Unmarshal([]byte(payload.Data), &memberRes)
				if err2 != nil {
					utils.Log(logrus.DebugLevel, err2)
					return
				}
				member = memberRes.Member
			} else if dataArr[0] == "/towers/join" {
				var memberRes pb.TowerJoinOutput
				err2 := json.Unmarshal([]byte(payload.Data), &memberRes)
				if err2 != nil {
					utils.Log(logrus.DebugLevel, err2)
					return
				}
				member = memberRes.Member
			}
			if member != nil {
				var query = `
			insert into member
			(
				human_id,
				tower_id,
				origin,
				user_origin
			) values ($1, $2, $3, $4)
			returning id;
		`
				var memberId int64
				if err := fed.sigmaCore.Database.Db.QueryRow(
					context.Background(), query, member.HumanId, member.TowerId, channelId, fed.sigmaCore.AppId,
				).Scan(&memberId); err != nil {
					utils.Log(logrus.DebugLevel, err)
					return
				}
				fed.sigmaCore.Pusher.JoinGroup(member.TowerId, member.HumanId, fed.sigmaCore.AppId)
			}
		}
		fed.sigmaCore.Pusher.PushToUser(payload.Key, payload.UserId, fed.sigmaCore.AppId, payload.Data, payload.RequestId, true)
	} else {
		dataArr := strings.Split(payload.Key, " ")
		if len(dataArr) > 0 && (dataArr[0] == "update") {
			fed.sigmaCore.Pusher.PushToUser(payload.Key[len("update "):], payload.UserId, fed.sigmaCore.AppId, payload.Data, "", true)
		} else if len(dataArr) > 0 && (dataArr[0] == "groupUpdate") {
			fed.sigmaCore.Pusher.PushToGroup(payload.Key[len("groupUpdate "):], payload.GroupId, payload.Data, payload.Exceptions)
		} else {
			action := fed.sigmaCore.Services.GetAction(payload.Key)
			check := action.Check
			location := modules.AuthorizeFedHumanWithProcessed(fed.sigmaCore, payload.UserId, channelId, payload.TowerId, payload.RoomId)
			if check.Tower && location.TowerId == 0 {
				errPack, err2 := json.Marshal(utils.BuildErrorJson("access denied"))
				if err2 == nil {
					fed.SendInFederation(channelId, modules.OriginPacket{IsResponse: true, Key: payload.Key, RequestId: payload.RequestId, Data: string(errPack), UserId: payload.UserId})
				}
				return
			}
			_, res, err := action.ProcessFederative(fed.sigmaCore, payload.Data, modules.Assistant{
				UserId:     payload.UserId,
				UserType:   "human",
				TowerId:    location.TowerId,
				RoomId:     location.RoomId,
				WorkerId:   0,
				UserOrigin: channelId,
			})
			if err != nil {
				utils.Log(logrus.DebugLevel, err)
				errPack, err2 := json.Marshal(utils.BuildErrorJson(err.Error()))
				if err2 == nil {
					fed.SendInFederation(channelId, modules.OriginPacket{IsResponse: true, Key: payload.Key, RequestId: payload.RequestId, Data: string(errPack), UserId: payload.UserId})
				}
				return
			}
			packet, err3 := json.Marshal(res)
			if err3 != nil {
				utils.Log(logrus.DebugLevel, err3)
				errPack, err2 := json.Marshal(utils.BuildErrorJson(err3.Error()))
				if err2 == nil {
					fed.SendInFederation(channelId, modules.OriginPacket{IsResponse: true, Key: payload.Key, RequestId: payload.RequestId, Data: string(errPack), UserId: payload.UserId})
				}
				return
			}
			fed.SendInFederation(channelId, modules.OriginPacket{IsResponse: true, Key: payload.Key, RequestId: payload.RequestId, Data: string(packet), UserId: payload.UserId})
		}
	}
}

func (fed *FedNet) SendInFederation(destOrg string, packet modules.OriginPacket) {
	if fed.fed {
		_, ok := fed.hostToIpMap[destOrg]
		if ok {
			statusCode, _, err := fiber.Post("https://" + destOrg + "/api/federation").JSON(packet).Bytes()
			if err != nil {
				utils.Log(logrus.DebugLevel, "could not send: status: %d error: %v", statusCode, err)
				utils.Log(logrus.DebugLevel)
			} else {
				utils.Log(logrus.DebugLevel, "packet sent successfully. status: ", statusCode)
			}
		} else {
			utils.Log(logrus.DebugLevel, "state org not found")
		}
	}
}

func New(sc *modules.App, ip2host map[string]string, host2ip map[string]string, fed bool) *FedNet {
	return &FedNet{sigmaCore: sc, ipToHostMap: ip2host, hostToIpMap: host2ip, fed: fed}
}
