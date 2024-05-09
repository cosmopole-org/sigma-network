package modules

import (
	"context"
	"encoding/json"
	"fmt"
	"net"
	"sigma/main/core/utils"
	"strconv"
	"strings"

	"github.com/mitchellh/mapstructure"
	"github.com/redis/go-redis/v9"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/peer"

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
	Storage       *redis.Client
	OtherStorages map[string]pb.FederationServiceClient
	FedHandler    func(app *App, channelId string, payload InterfedPacket)
	IFResChannel  chan [2][]byte
}

func (m *Memory) GetClient() *redis.Client {
	return m.Storage
}

func (m *Memory) CreateClient(redisUri string) {
	opts, err := redis.ParseURL(redisUri)
	if err != nil {
		panic(err)
	}
	db := redis.NewClient(opts)
	m.Storage = db
	myAddParts := strings.Split(app.AppId, "->")
	myPort, err := strconv.ParseInt(myAddParts[1], 10, 32)
	if err != nil {
		fmt.Printf("failed to parse port: %v", err)
		fmt.Println()
	}
	lis, err1 := net.Listen("tcp", fmt.Sprintf("localhost:%d", myPort+1))
	if err1 != nil {
		fmt.Printf("failed to listen: %v", err1)
		fmt.Println()
	}
	var opts2 []grpc.ServerOption
	grpcServer := grpc.NewServer(opts2...)
	pb.RegisterFederationServiceServer(grpcServer, &FederationServiceClient{})
	go grpcServer.Serve(lis)
	for org := range app.Federation {
		orgParts := strings.Split(org, "->")
		port, err := strconv.ParseInt(orgParts[1], 10, 32)
		if err != nil {
			panic(err.Error())
		}
		host := fmt.Sprintf("%s:%d", orgParts[0], port+1)
		conn, err := grpc.Dial(host, grpc.WithTransportCredentials(insecure.NewCredentials()))
		c := pb.NewFederationServiceClient(conn)
		if err != nil {
			fmt.Printf("did not connect: %v", err)
			fmt.Println()
		}
		m.OtherStorages[orgParts[0]] = c
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
						fmt.Println(err2)
						return
					}
					member = memberRes.Member
				} else if dataArr[0] == "/towers/join" {
					var memberRes pb.TowerJoinOutput
					err2 := json.Unmarshal([]byte(payload.Data), &memberRes)
					if err2 != nil {
						fmt.Println(err2)
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
						fmt.Println(err)
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
					fmt.Println(err2)
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
					fmt.Println(err)
					errPack, err2 := json.Marshal(utils.BuildErrorJson(err.Error()))
					if err2 == nil {
						m.SendInFederation(channelId, InterfedPacket{IsResponse: true, Key: payload.Key, RequestId: payload.RequestId, Data: string(errPack), UserId: payload.UserId})
					}
					return
				}
				packet, err3 := json.Marshal(result)
				if err3 != nil {
					fmt.Println(err3)
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

type FederationServiceClient struct {
	pb.UnimplementedFederationServiceServer
}

func (fsc *FederationServiceClient) Send(ctx context.Context, p *pb.InterfedPacket) (*pb.InterfedDummy, error) {
	var pack InterfedPacket
	mapstructure.Decode(p, &pack)
	clientCtx, _ := peer.FromContext(ctx)
	fmt.Println("packet from : ", clientCtx.Addr.String())
	ipAddr := strings.Split(clientCtx.Addr.String(), ":")[0]
	if ipAddr == "127.0.0.1" {
		ipAddr = "localhost"
	}
	hostName := ""
	for address := range app.Federation {
		if strings.Split(address, "->")[0] == ipAddr {
			hostName = address
			break
		}
	}
	if hostName != "" {
		app.Memory.FedHandler(Instance(), hostName, pack)
	}
	return &pb.InterfedDummy{}, nil
}

func (m *Memory) SendInFederation(destOrg string, packet InterfedPacket) {
	var p pb.InterfedPacket
	mapstructure.Decode(packet, &p)
	if m.OtherStorages[strings.Split(destOrg, "->")[0]] != nil {
		var pack pb.InterfedPacket
		mapstructure.Decode(packet, &pack)
		_, err2 := m.OtherStorages[strings.Split(destOrg, "->")[0]].Send(context.Background(), &pack)
		if err2 != nil {
			fmt.Printf("could not send: %v", err2)
			fmt.Println()
		}
	}
}

func (m *Memory) Put(key string, value string) {
	err := m.Storage.Set(context.Background(), key, value, 0).Err()
	if err != nil {
		fmt.Println(err)
	}
}

func (m *Memory) Get(key string) string {
	val, err := m.Storage.Get(context.Background(), key).Result()
	if err == redis.Nil {
		fmt.Println("key: " + key + " does not exist")
		return ""
	} else if err != nil {
		fmt.Println(err)
		return ""
	}
	return val
}

func (m *Memory) Del(key string) {
	err := m.Storage.Del(context.Background(), key).Err()
	if err != nil {
		fmt.Println(err)
	}
}

func CreateMemory(redisUri string) *Memory {
	memory := &Memory{
		OtherStorages: map[string]pb.FederationServiceClient{},
	}
	fmt.Println("connecting to redis...")
	memory.CreateClient(redisUri)
	return memory
}
