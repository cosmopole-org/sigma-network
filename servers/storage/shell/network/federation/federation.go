package shell_federation

import (
	"context"
	"encoding/json"
	"log"
	"sigma/storage/core/modules"
	"sigma/storage/core/utils"
	"sigma/storage/shell/store/config"
	"sigma/storage/shell/store/core"
	"sigma/storage/shell/store/ipmap"
	"strings"

	pb "sigma/storage/core/models/grpc"

	"github.com/gofiber/fiber/v2"
)

type FedNet struct {
}

func (fed *FedNet) LoadFedNet(f *fiber.App) {
	f.Post("/api/federation", func(c *fiber.Ctx) error {
		var pack modules.OriginPacket
		c.BodyParser(&pack)
		ip := utils.FromRequest(c.Context())
		hostName, ok := ipmap.IpToHostMap()[ip]
		log.Println("packet from ip: [", ip, "] and hostname: [", hostName, "]")
		if ok {
			fed.HandlePacket(hostName, pack)
			return c.Status(fiber.StatusOK).JSON(modules.ResponseSimpleMessage{Message: "federation packet received"})
		} else {
			log.Println("hostname not known")
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
					log.Println(err2)
					return
				}
				member = memberRes.Member
			} else if dataArr[0] == "/towers/join" {
				var memberRes pb.TowerJoinOutput
				err2 := json.Unmarshal([]byte(payload.Data), &memberRes)
				if err2 != nil {
					log.Println(err2)
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
				if err := core.Core().Database.Db.QueryRow(
					context.Background(), query, member.HumanId, member.TowerId, channelId, core.Core().AppId,
				).Scan(&memberId); err != nil {
					log.Println(err)
					return
				}
				core.Core().Pusher.JoinGroup(member.TowerId, member.HumanId, core.Core().AppId)
			}
		}
		core.Core().Pusher.PushToUser(payload.Key, payload.UserId, core.Core().AppId, payload.Data, payload.RequestId, true)
	} else {
		dataArr := strings.Split(payload.Key, " ")
		if len(dataArr) > 0 && (dataArr[0] == "update") {
			core.Core().Pusher.PushToUser(payload.Key[len("update "):], payload.UserId, core.Core().AppId, payload.Data, "", true)
		} else if len(dataArr) > 0 && (dataArr[0] == "groupUpdate") {
			core.Core().Pusher.PushToGroup(payload.Key[len("groupUpdate "):], payload.GroupId, payload.Data, payload.Exceptions)
		} else {
			action := core.Core().Services.GetAction(payload.Key)
			check := action.Check
			location := modules.AuthorizeFedHumanWithProcessed(core.Core(), payload.UserId, channelId, payload.TowerId, payload.RoomId)
			if check.Tower && location.TowerId == 0 {
				errPack, err2 := json.Marshal(utils.BuildErrorJson("access denied"))
				if err2 == nil {
					fed.SendInFederation(channelId, modules.OriginPacket{IsResponse: true, Key: payload.Key, RequestId: payload.RequestId, Data: string(errPack), UserId: payload.UserId})
				}
				return
			}
			_, res, err := action.ProcessFederative(core.Core(), payload.Data, modules.Assistant{
				UserId:     payload.UserId,
				UserType:   "human",
				TowerId:    location.TowerId,
				RoomId:     location.RoomId,
				WorkerId:   0,
				UserOrigin: channelId,
			})
			if err != nil {
				log.Println(err)
				errPack, err2 := json.Marshal(utils.BuildErrorJson(err.Error()))
				if err2 == nil {
					fed.SendInFederation(channelId, modules.OriginPacket{IsResponse: true, Key: payload.Key, RequestId: payload.RequestId, Data: string(errPack), UserId: payload.UserId})
				}
				return
			}
			packet, err3 := json.Marshal(res)
			if err3 != nil {
				log.Println(err3)
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
	if config.Federative() {
		_, ok := ipmap.HostToIpMap()[destOrg]
		if ok {
			statusCode, _, err := fiber.Post("https://" + destOrg + "/api/federation").JSON(packet).Bytes()
			if err != nil {
				log.Printf("could not send: status: %d error: %v", statusCode, err)
				log.Println()
			} else {
				log.Println("packet sent successfully. status: ", statusCode)
			}
		} else {
			log.Println("state org not found")
		}
	}
}

func New() *FedNet {
	return &FedNet{}
}
