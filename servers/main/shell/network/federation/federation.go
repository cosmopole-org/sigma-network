package shell_federation

import (
	"context"
	"encoding/json"
	"log"
	"sigma/main/core/modules"
	"sigma/main/core/utils"
	shell_http "sigma/main/shell/network/http"
	"strings"

	pb "sigma/main/core/models/grpc"

	"github.com/gofiber/fiber/v2"
	"github.com/mitchellh/mapstructure"
)

type FedNet struct {
	
}

func (fed *FedNet) LoadFedNet(app *modules.App, hs *shell_http.HttpServer) {
	if app.Federative {
		hs.Server.Post("/api/federation", func(c *fiber.Ctx) error {
			var pack modules.OriginPacket
			c.BodyParser(&pack)
			ip := utils.FromRequest(c.Context())
			hostName, ok := app.IpToHost[ip]
			log.Println("packet from ip: [", ip, "] and hostname: [", hostName, "]")
			if ok {
				fed.HandlePacket(app, hostName, pack)
				return c.Status(fiber.StatusOK).JSON(modules.ResponseSimpleMessage{Message: "federation packet received"})
			} else {
				log.Println("hostname not known")
				return c.Status(fiber.StatusOK).JSON(modules.ResponseSimpleMessage{Message: "hostname not known"})
			}
		})
	}
}

func (fed *FedNet) HandlePacket(app *modules.App, channelId string, payload modules.OriginPacket) {
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
				if err := app.Database.Db.QueryRow(
					context.Background(), query, member.HumanId, member.TowerId, channelId, app.AppId,
				).Scan(&memberId); err != nil {
					log.Println(err)
					return
				}
				app.Network.PusherServer.JoinGroup(member.TowerId, member.HumanId, app.AppId)
			}
		}
		app.Network.PusherServer.PushToUser(payload.Key, payload.UserId, app.AppId, payload.Data, payload.RequestId, true)
	} else {
		dataArr := strings.Split(payload.Key, " ")
		if len(dataArr) > 0 && (dataArr[0] == "update") {
			app.Network.PusherServer.PushToUser(payload.Key[len("update "):], payload.UserId, app.AppId, payload.Data, "", true)
		} else if len(dataArr) > 0 && (dataArr[0] == "groupUpdate") {
			app.Network.PusherServer.PushToGroup(payload.Key[len("groupUpdate "):], payload.GroupId, payload.Data, payload.Exceptions)
		} else {
			var input any
			err2 := json.Unmarshal([]byte(payload.Data), &input)
			if err2 != nil {
				log.Println(err2)
				return
			}
			fn := modules.Handlers[payload.Key]
			f := modules.Frames[payload.Key]
			check := modules.Checks[payload.Key]
			location := modules.AuthorizeFedHumanWithProcessed(app, payload.UserId, channelId, payload.TowerId, payload.RoomId)
			if check.Tower && location.TowerId == 0 {
				errPack, err2 := json.Marshal(utils.BuildErrorJson("access denied"))
				if err2 == nil {
					fed.SendInFederation(app, channelId, modules.OriginPacket{IsResponse: true, Key: payload.Key, RequestId: payload.RequestId, Data: string(errPack), UserId: payload.UserId})
				}
				return
			}
			mapstructure.Decode(input, &f)
			result, err := fn(app, f, modules.Assistant{
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
					fed.SendInFederation(app, channelId, modules.OriginPacket{IsResponse: true, Key: payload.Key, RequestId: payload.RequestId, Data: string(errPack), UserId: payload.UserId})
				}
				return
			}
			packet, err3 := json.Marshal(result)
			if err3 != nil {
				log.Println(err3)
				errPack, err2 := json.Marshal(utils.BuildErrorJson(err3.Error()))
				if err2 == nil {
					fed.SendInFederation(app, channelId, modules.OriginPacket{IsResponse: true, Key: payload.Key, RequestId: payload.RequestId, Data: string(errPack), UserId: payload.UserId})
				}
				return
			}
			fed.SendInFederation(app, channelId, modules.OriginPacket{IsResponse: true, Key: payload.Key, RequestId: payload.RequestId, Data: string(packet), UserId: payload.UserId})
		}
	}
}

func (fed *FedNet) SendInFederation(app *modules.App, destOrg string, packet modules.OriginPacket) {
	if app.Federative {
		_, ok := app.HostToIp[destOrg]
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