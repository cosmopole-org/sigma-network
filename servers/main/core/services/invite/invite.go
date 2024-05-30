package services_invite

import (
	"errors"
	"fmt"
	inputs_invites "sigma/main/core/inputs/invites"
	"sigma/main/core/models"
	outputs_invites "sigma/main/core/outputs/invites"
	"sigma/main/core/runtime"
	updates_invites "sigma/main/core/updates/invites"
	"sigma/main/core/utils"

	"github.com/gofiber/fiber/v2"
	"google.golang.org/grpc"
)

func create(app *runtime.App, input inputs_invites.CreateInput, info models.Info) (any, error) {
	space := models.Space{Id: input.SpaceId}
	err := app.Managers.DatabaseManager().Db.First(&space).Error
	if err != nil {
		return nil, err
	}
	invite := models.Invite{Id: utils.SecureUniqueId(app.AppId), UserId: input.UserId, SpaceId: input.SpaceId}
	err2 := app.Managers.DatabaseManager().Db.Create(&invite).Error
	if err2 != nil {
		return nil, err2
	}
	go app.Managers.PushManager().PushToUser("invites/create", input.UserId, updates_invites.Create{Invite: invite}, "", false)
	return outputs_invites.CreateOutput{Invite: invite}, nil
}

func cancel(app *runtime.App, input inputs_invites.CancelInput, info models.Info) (any, error) {
	admin := models.Admin{UserId: info.User.Id, SpaceId: input.SpaceId}
	err := app.Managers.DatabaseManager().Db.First(&admin).Error
	if err != nil {
		return nil, err
	}
	invite := models.Invite{Id: input.InviteId}
	err2 := app.Managers.DatabaseManager().Db.First(&invite).Error
	if err2 != nil {
		return nil, err2
	}
	if invite.SpaceId != input.SpaceId {
		return nil, errors.New("invite not found")
	}
	err3 := app.Managers.DatabaseManager().Db.Delete(&invite).Error
	if err3 != nil {
		return nil, err3
	}
	go app.Managers.PushManager().PushToUser("invites/cancel", invite.UserId, updates_invites.Cancel{Invite: invite}, "", false)
	return outputs_invites.CancelOutput{Invite: invite}, nil
}

var memberTemplate = "member::%s::%s"

func accept(app *runtime.App, input inputs_invites.AcceptInput, info models.Info) (any, error) {
	invite := models.Invite{Id: input.InviteId}
	err := app.Managers.DatabaseManager().Db.First(&invite).Error
	if err != nil {
		return nil, err
	}
	if invite.UserId != info.User.Id {
		return nil, errors.New("invite not found")
	}
	err2 := app.Managers.DatabaseManager().Db.Delete(&invite).Error
	if err2 != nil {
		return nil, err2
	}
	member := models.Member{Id: utils.SecureUniqueId(app.AppId), UserId: invite.UserId, SpaceId: invite.SpaceId, TopicIds: "*", Metadata: ""}
	app.Managers.DatabaseManager().Db.Create(&member)
	app.Managers.PushManager().JoinGroup(member.SpaceId, member.UserId)
	app.Managers.MemoryManager().Put(fmt.Sprintf(memberTemplate, member.SpaceId, member.UserId), "true")
	admins := []models.Admin{}
	app.Managers.DatabaseManager().Db.Where("space_id = ?", invite.SpaceId).Find(&admins)
	for _, admin := range admins {
		go app.Managers.PushManager().PushToUser("invites/accept", admin.UserId, updates_invites.Accept{Invite: invite}, "", false)
	}
	go app.Managers.PushManager().PushToGroup("invites/accept", invite.SpaceId, updates_invites.Accept{Invite: invite}, []models.Client{})
	return outputs_invites.AcceptOutput{Member: member}, nil
}

func decline(app *runtime.App, input inputs_invites.DeclineInput, info models.Info) (any, error) {
	invite := models.Invite{Id: input.InviteId}
	err := app.Managers.DatabaseManager().Db.First(&invite).Error
	if err != nil {
		return nil, err
	}
	if invite.UserId != info.User.Id {
		return nil, errors.New("invite not found")
	}
	err2 := app.Managers.DatabaseManager().Db.Delete(&invite).Error
	if err2 != nil {
		return nil, err2
	}
	admins := []models.Admin{}
	app.Managers.DatabaseManager().Db.Where("space_id = ?", invite.SpaceId).Find(&admins)
	for _, admin := range admins {
		go app.Managers.PushManager().PushToUser("invites/accept", admin.UserId, updates_invites.Accept{Invite: &invite}, "", false)
	}
	return outputs_invites.DeclineOutput{}, nil
}

func CreateInviteService(app *runtime.App, openToNet bool) {

	app.Managers.DatabaseManager().Db.AutoMigrate(&models.Invite{})

	app.Services.AddAction(runtime.CreateAction(
		app,
		"/invites/create",
		runtime.CreateCk(true, true, false),
		runtime.CreateAc(openToNet, true, false, false, fiber.MethodPost),
		true,
		create,
	))
	app.Services.AddAction(runtime.CreateAction(
		app,
		"/invites/cancel",
		runtime.CreateCk(true, true, false),
		runtime.CreateAc(openToNet, true, false, false, fiber.MethodPost),
		true,
		cancel,
	))
	app.Services.AddAction(runtime.CreateAction(
		app,
		"/invites/accept",
		runtime.CreateCk(true, false, false),
		runtime.CreateAc(openToNet, true, false, false, fiber.MethodPost),
		true,
		accept,
	))
	app.Services.AddAction(runtime.CreateAction(
		app,
		"/invites/decline",
		runtime.CreateCk(true, false, false),
		runtime.CreateAc(openToNet, true, false, false, fiber.MethodPost),
		true,
		decline,
	))
}

func LoadInviteGrpcService(grpcServer *grpc.Server) {
	// type server struct {
	// 	pb.UnimplementedInviteServiceServer
	// }
	// pb.RegisterInviteServiceServer(grpcServer, &server{})
}
