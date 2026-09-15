package net_federation

import (
	"encoding/json"
	"errors"
	"net"
	"sigma/sigma/abstract"
	module_logger "sigma/sigma/core/module/logger"
	"sigma/sigma/layer1/adapters"
	models "sigma/sigma/layer1/model"
	module_actor_model "sigma/sigma/layer1/module/actor"
	"sigma/sigma/layer1/tools/signaler"
	"sigma/sigma/utils/crypto"
	"sigma/sigma/utils/ip"
	"sigma/sigverse/model"
	outputs_invites "sigma/sigverse/outputs/invites"
	outputs_spaces "sigma/sigverse/outputs/spaces"
	"strings"

	"github.com/gofiber/fiber/v2"
)

type FedNet struct {
	sigmaCore        abstract.ICore
	storage          adapters.IStorage
	signaler         *signaler.Signaler
	logger           *module_logger.Logger
	ipToHostMap      map[string]string
	hostToIpMap      map[string]string
	baseUrlMap       map[string]string
	wellKnownServers []string
	fed              bool
}

// FirstStageBackFill builds the peer table. Each well-known server is given
// either as a bare domain, which is resolved by DNS and reached over HTTPS on
// the default port, or as "<server-id>=<base-url>", which names the peer's
// base URL explicitly. The second form exists so that a federation can be
// stood up on one host (for testing and for measurement) without TLS
// certificates or distinct public addresses.
func FirstStageBackFill(core abstract.ICore, wellKnownServers []string, logger *module_logger.Logger) adapters.IFederation {
	fed := &FedNet{sigmaCore: core, logger: logger, wellKnownServers: wellKnownServers}
	fed.ipToHostMap = map[string]string{}
	fed.hostToIpMap = map[string]string{}
	fed.baseUrlMap = map[string]string{}
	fed.fed = len(wellKnownServers) > 0
	for _, entry := range wellKnownServers {
		domain := entry
		if idx := strings.Index(entry, "="); idx > 0 {
			domain = entry[:idx]
			baseUrl := strings.TrimSuffix(entry[idx+1:], "/")
			fed.baseUrlMap[domain] = baseUrl
			host := baseUrl
			if i := strings.Index(host, "://"); i >= 0 {
				host = host[i+3:]
			}
			if i := strings.Index(host, ":"); i >= 0 {
				host = host[:i]
			}
			if ip := net.ParseIP(host); ip != nil {
				fed.ipToHostMap[ip.String()] = domain
				fed.hostToIpMap[domain] = ip.String()
				continue
			}
			domain = host
		}
		ipAddr := ""
		ips, _ := net.LookupIP(domain)
		for _, ip := range ips {
			if ipv4 := ip.To4(); ipv4 != nil {
				ipAddr = ipv4.String()
				break
			}
		}
		fed.ipToHostMap[ipAddr] = domain
		fed.hostToIpMap[domain] = ipAddr
	}
	logger.Println()
	logger.Println(fed.hostToIpMap)
	logger.Println()
	return fed
}

func (fed *FedNet) SecondStageForFill(f *fiber.App, storage adapters.IStorage, signaler *signaler.Signaler) adapters.IFederation {
	fed.storage = storage
	fed.signaler = signaler
	if fed.fed {
		f.Post("/api/federation", func(c *fiber.Ctx) error {
			var pack models.OriginPacket
			err := c.BodyParser(&pack)
			if err != nil {
				return c.Status(fiber.StatusBadRequest).JSON(models.BuildErrorJson(err.Error()))
			}
			ip := realip.FromRequest(c.Context())
			hostName, ok := fed.ipToHostMap[ip]
			fed.logger.Println("packet from ip: [", ip, "] and hostname: [", hostName, "]")
			if ok {
				fed.HandlePacket(hostName, pack)
				return c.Status(fiber.StatusOK).JSON(models.ResponseSimpleMessage{Message: "federation packet received"})
			} else {
				fed.logger.Println("hostname not known")
				return c.Status(fiber.StatusOK).JSON(models.ResponseSimpleMessage{Message: "hostname not known"})
			}
		})
	}
	return fed
}

func ParseInput[T abstract.IInput](i string) (abstract.IInput, error) {
	body := new(T)
	err := json.Unmarshal([]byte(i), body)
	if err != nil {
		return nil, errors.New("invalid input format")
	}
	return *body, nil
}

func (fed *FedNet) HandlePacket(channelId string, payload models.OriginPacket) {
	if fed.fed {
		if payload.IsResponse {
			dataArr := strings.Split(payload.Key, " ")
			if dataArr[0] == "/invites/accept" || dataArr[0] == "/spaces/join" {
				var member *model.Member
				if dataArr[0] == "/invites/accept" {
					var memberRes outputs_invites.AcceptOutput
					err2 := json.Unmarshal([]byte(payload.Data), &memberRes)
					if err2 != nil {
						fed.logger.Println(err2)
						return
					}
					member = &memberRes.Member
				} else if dataArr[0] == "/spaces/join" {
					var memberRes outputs_spaces.JoinOutput
					err2 := json.Unmarshal([]byte(payload.Data), &memberRes)
					if err2 != nil {
						fed.logger.Println(err2)
						return
					}
					member = &memberRes.Member
				}
				if member != nil {
					member.Id = crypto.SecureUniqueId(fed.sigmaCore.Id()) + "_" + channelId
					fed.storage.Create(member)
					fed.signaler.JoinGroup(member.SpaceId, member.UserId)
				}
			}
			fed.signaler.SignalUser(payload.Key, payload.RequestId, payload.UserId, payload.Data, true)
		} else {
			dataArr := strings.Split(payload.Key, " ")
			if len(dataArr) > 0 && (dataArr[0] == "update") {
				fed.signaler.SignalUser(payload.Key[len("update "):], "", payload.UserId, payload.Data, true)
			} else if len(dataArr) > 0 && (dataArr[0] == "groupUpdate") {
				fed.signaler.SignalGroup(payload.Key[len("groupUpdate "):], payload.SpaceId, payload.Data, true, payload.Exceptions)
			} else {
				// Layers are addressed from 1; a packet that carries no layer
				// (the forwarding path does not set one) means the action
				// layer, and an out-of-range value must not index the slice.
				layerNum := payload.Layer
				if layerNum < 1 || layerNum > len(fed.sigmaCore.Layers()) {
					layerNum = 1
				}
				layer := fed.sigmaCore.Get(layerNum)
				action := layer.Actor().FetchAction(payload.Key)
				if action == nil {
					errPack, _ := json.Marshal(models.BuildErrorJson("action not found"))
					fed.SendInFederation(channelId, models.OriginPacket{IsResponse: true, Key: payload.Key, RequestId: payload.RequestId, Data: string(errPack), UserId: payload.UserId})
					return
				}
				// Wasm-hosted actions register one global parser instead of a
				// parser per transport.
				protocol := "fed"
				if action.(*module_actor_model.SecureAction).HasGlobalParser() {
					protocol = "*"
				}
				input, err := action.(*module_actor_model.SecureAction).ParseInput(protocol, payload.Data)
				if err != nil {
					errPack, _ := json.Marshal(models.BuildErrorJson("input could not be parsed"))
					fed.SendInFederation(channelId, models.OriginPacket{IsResponse: true, Key: payload.Key, RequestId: payload.RequestId, Data: string(errPack), UserId: payload.UserId})
					return
				}
				_, res, err := action.(*module_actor_model.SecureAction).SecurelyActFed(layer, payload.UserId, input)
				if err != nil {
					fed.logger.Println(err)
					errPack, err2 := json.Marshal(models.BuildErrorJson(err.Error()))
					if err2 == nil {
						fed.SendInFederation(channelId, models.OriginPacket{IsResponse: true, Key: payload.Key, RequestId: payload.RequestId, Data: string(errPack), UserId: payload.UserId})
					}
					return
				}
				packet, err3 := json.Marshal(res)
				if err3 != nil {
					fed.logger.Println(err3)
					errPack, err2 := json.Marshal(models.BuildErrorJson(err3.Error()))
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
			base, hasBase := fed.baseUrlMap[destOrg]
			if !hasBase {
				base = "https://" + destOrg
			}
			statusCode, _, err := fiber.Post(base + "/api/federation").JSON(packet).Bytes()
			if err != nil {
				fed.logger.Println("could not send: status: %d error: %v", statusCode, err)
			} else {
				fed.logger.Println("packet sent successfully. status: ", statusCode)
			}
		} else {
			fed.logger.Println("state org not found")
		}
	}
}

func (fed *FedNet) WellKnownServers() []string {
	return fed.wellKnownServers
}
