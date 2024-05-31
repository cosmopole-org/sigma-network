package services_invite

import (
	"errors"
	"fmt"
	inputs_invites "sigma/main/core/inputs/invites"
	"sigma/main/core/managers"
	"sigma/main/core/models"
	outputs_invites "sigma/main/core/outputs/invites"
	"sigma/main/core/runtime"
	updates_invites "sigma/main/core/updates/invites"
	"sigma/main/core/utils"

	"github.com/gofiber/fiber/v2"
	"google.golang.org/grpc"
)

type InviteService struct {
	managers managers.ICoreManagers
}

func (s *InviteService) create(control *runtime.Control, input inputs_invites.CreateInput, info models.Info) (any, error) {
	space := models.Space{Id: input.SpaceId}
	err := control.Trx.First(&space).Error()
	if err != nil {
		return nil, err
	}
	invite := models.Invite{Id: utils.SecureUniqueId(control.AppId), UserId: input.UserId, SpaceId: input.SpaceId}
	err2 := control.Trx.Create(&invite).Error()
	if err2 != nil {
		return nil, err2
	}
	go s.managers.PushManager().PushToUser("invites/create", input.UserId, updates_invites.Create{Invite: invite}, "", false)
	return outputs_invites.CreateOutput{Invite: invite}, nil
}

func (s *InviteService) cancel(control *runtime.Control, input inputs_invites.CancelInput, info models.Info) (any, error) {
	admin := models.Admin{UserId: info.User.Id, SpaceId: input.SpaceId}
	err := control.Trx.First(&admin).Error()
	if err != nil {
		return nil, err
	}
	invite := models.Invite{Id: input.InviteId}
	err2 := control.Trx.First(&invite).Error()
	if err2 != nil {
		return nil, err2
	}
	if invite.SpaceId != input.SpaceId {
		return nil, errors.New("invite not found")
	}
	err3 := control.Trx.Delete(&invite).Error()
	if err3 != nil {
		return nil, err3
	}
	go s.managers.PushManager().PushToUser("invites/cancel", invite.UserId, updates_invites.Cancel{Invite: invite}, "", false)
	return outputs_invites.CancelOutput{Invite: invite}, nil
}

var memberTemplate = "member::%s::%s"

func (s *InviteService) accept(control *runtime.Control, input inputs_invites.AcceptInput, info models.Info) (any, error) {
	invite := models.Invite{Id: input.InviteId}
	err := control.Trx.First(&invite).Error()
	if err != nil {
		return nil, err
	}
	if invite.UserId != info.User.Id {
		return nil, errors.New("invite not found")
	}
	err2 := control.Trx.Delete(&invite).Error()
	if err2 != nil {
		return nil, err2
	}
	member := models.Member{Id: utils.SecureUniqueId(control.AppId), UserId: invite.UserId, SpaceId: invite.SpaceId, TopicIds: "*", Metadata: ""}
	control.Trx.Create(&member)
	s.managers.PushManager().JoinGroup(member.SpaceId, member.UserId)
	s.managers.MemoryManager().Put(fmt.Sprintf(memberTemplate, member.SpaceId, member.UserId), "true")
	admins := []models.Admin{}
	control.Trx.Where("space_id = ?", invite.SpaceId).Find(&admins)
	for _, admin := range admins {
		go s.managers.PushManager().PushToUser("invites/accept", admin.UserId, updates_invites.Accept{Invite: invite}, "", false)
	}
	go s.managers.PushManager().PushToGroup("invites/accept", invite.SpaceId, updates_invites.Accept{Invite: invite}, []models.Client{})
	return outputs_invites.AcceptOutput{Member: member}, nil
}

func (s *InviteService) decline(control *runtime.Control, input inputs_invites.DeclineInput, info models.Info) (any, error) {
	invite := models.Invite{Id: input.InviteId}
	err := control.Trx.First(&invite).Error()
	if err != nil {
		return nil, err
	}
	if invite.UserId != info.User.Id {
		return nil, errors.New("invite not found")
	}
	err2 := control.Trx.Delete(&invite).Error()
	if err2 != nil {
		return nil, err2
	}
	admins := []models.Admin{}
	control.Trx.Where("space_id = ?", invite.SpaceId).Find(&admins)
	for _, admin := range admins {
		go s.managers.PushManager().PushToUser("invites/accept", admin.UserId, updates_invites.Accept{Invite: &invite}, "", false)
	}
	return outputs_invites.DeclineOutput{}, nil
}

func CreateInviteService(app *runtime.App) {

	service := &InviteService{managers: app.Managers}

	app.Managers.StorageManager().AutoMigrate(&models.Invite{})

	app.Services.AddAction(runtime.CreateAction(
		app,
		"/invites/create",
		runtime.CreateCk(true, true, false),
		runtime.CreateAc(app.CoreAccess, true, false, false, fiber.MethodPost),
		true,
		service.create,
	))
	app.Services.AddAction(runtime.CreateAction(
		app,
		"/invites/cancel",
		runtime.CreateCk(true, true, false),
		runtime.CreateAc(app.CoreAccess, true, false, false, fiber.MethodPost),
		true,
		service.cancel,
	))
	app.Services.AddAction(runtime.CreateAction(
		app,
		"/invites/accept",
		runtime.CreateCk(true, false, false),
		runtime.CreateAc(app.CoreAccess, true, false, false, fiber.MethodPost),
		true,
		service.accept,
	))
	app.Services.AddAction(runtime.CreateAction(
		app,
		"/invites/decline",
		runtime.CreateCk(true, false, false),
		runtime.CreateAc(app.CoreAccess, true, false, false, fiber.MethodPost),
		true,
		service.decline,
	))
}

func LoadInviteGrpcService(grpcServer *grpc.Server) {
	// type server struct {
	// 	pb.UnimplementedInviteServiceServer
	// }
	// pb.RegisterInviteServiceServer(grpcServer, &server{})
}
