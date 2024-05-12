package modules

import (
	"context"
	"encoding/json"
	"log"
	"sigma/main/core/utils"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/mitchellh/mapstructure"
	"github.com/redis/go-redis/v9"

	pb "sigma/main/shell/grpc"
)

type InterfedPacket struct {
	Key        string
	UserId     int64
	TowerId    int64
	RoomId     int64
	RequestId  string
	Data       string
	IsResponse bool
	GroupId    int64
	Exceptions []GroupMember
}

type Memory struct {
	Storage      *redis.Client
	Servers      map[string]pb.FederationServiceClient
	FedHandler   func(app *App, channelId string, payload InterfedPacket)
	IFResChannel chan [2][]byte
}

func (m *Memory) GetClient() *redis.Client {
	return m.Storage
}

type FederationServer struct {
	pb.UnimplementedFederationServiceServer
}

func (fsc *FederationServer) Send(ctx context.Context, p *pb.InterfedPacket) (*pb.InterfedDummy, error) {

	return &pb.InterfedDummy{}, nil
}

func (m *Memory) CreateClient(redisUri string) {
	opts, err := redis.ParseURL(redisUri)
	if err != nil {
		panic(err)
	}
	db := redis.NewClient(opts)
	m.Storage = db
	if app.Federative {
		app.Network.HttpServer.Server.Post("/api/federation", func(c *fiber.Ctx) error {
			var pack InterfedPacket
			c.BodyParser(&pack)
			ip := utils.FromRequest(c.Context())
			hostName, ok := app.IpToHost[ip]
			log.Println("packet from ip: [", ip, "] and hostname: [", hostName, "]")
			if ok {
				app.Memory.FedHandler(Instance(), hostName, pack)
				return c.Status(fiber.StatusOK).JSON(ResponseSimpleMessage{Message: "federation packet received"})
			} else {
				log.Println("hostname not known")
				return c.Status(fiber.StatusOK).JSON(ResponseSimpleMessage{Message: "hostname not known"})
			}
		})
	}
	m.FedHandler = func(app *App, channelId string, payload InterfedPacket) {
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
						context.Background(), query, member.HumanId, member.TowerId, member.Origin, member.UserOrigin,
					).Scan(&memberId); err != nil {
						log.Println(err)
						return
					}
					app.Network.PusherServer.JoinGroup(member.TowerId, member.HumanId, member.UserOrigin)
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
				fn := Handlers[payload.Key]
				f := Frames[payload.Key]
				check := Checks[payload.Key]
				location := AuthorizeFedHumanWithProcessed(app, payload.UserId, channelId, payload.TowerId, payload.RoomId)
				if check.Tower && location.TowerId == 0 {
					errPack, err2 := json.Marshal(utils.BuildErrorJson("access denied"))
					if err2 == nil {
						m.SendInFederation(channelId, InterfedPacket{IsResponse: true, Key: payload.Key, RequestId: payload.RequestId, Data: string(errPack), UserId: payload.UserId})
					}
					return
				}
				mapstructure.Decode(input, &f)
				result, err := fn(app, f, Assistant{
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
						m.SendInFederation(channelId, InterfedPacket{IsResponse: true, Key: payload.Key, RequestId: payload.RequestId, Data: string(errPack), UserId: payload.UserId})
					}
					return
				}
				packet, err3 := json.Marshal(result)
				if err3 != nil {
					log.Println(err3)
					errPack, err2 := json.Marshal(utils.BuildErrorJson(err3.Error()))
					if err2 == nil {
						m.SendInFederation(channelId, InterfedPacket{IsResponse: true, Key: payload.Key, RequestId: payload.RequestId, Data: string(errPack), UserId: payload.UserId})
					}
					return
				}
				m.SendInFederation(channelId, InterfedPacket{IsResponse: true, Key: payload.Key, RequestId: payload.RequestId, Data: string(packet), UserId: payload.UserId})
			}
		}
	}
}

func (m *Memory) SendInFederation(destOrg string, packet InterfedPacket) {
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

func (m *Memory) Put(key string, value string) {
	err := m.Storage.Set(context.Background(), key, value, 0).Err()
	if err != nil {
		log.Println(err)
	}
}

func (m *Memory) Get(key string) string {
	val, err := m.Storage.Get(context.Background(), key).Result()
	if err == redis.Nil {
		log.Println("key: " + key + " does not exist")
		return ""
	} else if err != nil {
		log.Println(err)
		return ""
	}
	return val
}

func (m *Memory) Del(key string) {
	err := m.Storage.Del(context.Background(), key).Err()
	if err != nil {
		log.Println(err)
	}
}

func CreateMemory(redisUri string) *Memory {
	memory := &Memory{}
	log.Println("connecting to redis...")
	memory.CreateClient(redisUri)
	return memory
}
