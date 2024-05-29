package services

import (
	"context"
	"errors"
	"fmt"
	inputs_invites "sigma/main/core/inputs/invites"
	"sigma/main/core/models"
	"sigma/main/core/runtime"
	updates_invites "sigma/main/core/updates/invites"
	"sigma/main/core/utils"

	pb "sigma/main/core/models/grpc"

	"github.com/gofiber/fiber/v2"
	"google.golang.org/grpc"
)

func createInvite(app *runtime.App, input inputs_invites.CreateInput, info models.Info) (any, error) {
	var query0 = `
		select id from space where id = $1;
	`
	var spaceId int64
	if err0 := app.Managers.DatabaseManager().Db.QueryRow(
		context.Background(), query0, info.SpaceId,
	).Scan(&spaceId); err0 != nil {
		utils.Log(5, err0)
		return &pb.InviteCreateOutput{}, errors.New("space not found")
	}
	ro := input.RecepientOrigin
	if ro == "" {
		ro = app.AppId
	}
	var query = `
		insert into invite
		(
			human_id,
			space_id,
			origin,
			user_origin
		) values ($1, $2, $3, $4)
		returning id, human_id, space_id;
	`
	var invite pb.Invite
	if err := app.Managers.DatabaseManager().Db.QueryRow(
		context.Background(), query, input.UserId, info.SpaceId, app.AppId, ro,
	).Scan(&invite.Id, &invite.UserId, &invite.SpaceId); err != nil {
		utils.Log(5, err)
		return &pb.InviteCreateOutput{}, err
	}
	invite.Origin = app.AppId
	invite.UserOrigin = ro
	go app.Managers.PushManager().PushToUser("invites/create", input.UserId, ro, updates_invites.Create{Invite: &invite}, "", false)
	return &pb.InviteCreateOutput{Invite: &invite}, nil
}

func cancelInvite(app *runtime.App, input inputs_invites.CancelInput, info models.Info) (any, error) {
	var query = `
		delete from invite where id = $1 and space_id = $2
		returning id, human_id, space_id, user_origin;
	`
	var invite pb.Invite
	if err := app.Managers.DatabaseManager().Db.QueryRow(
		context.Background(), query, input.InviteId, info.SpaceId,
	).Scan(&invite.Id, &invite.UserId, &invite.SpaceId, &invite.UserOrigin); err != nil {
		utils.Log(5, err)
		return &pb.InviteCancelOutput{}, err
	}
	go app.Managers.PushManager().PushToUser("invites/cancel", invite.UserId, invite.UserOrigin, updates_invites.Cancel{Invite: &invite}, "", false)
	return &pb.InviteCancelOutput{}, nil
}

func acceptInvite(app *runtime.App, input inputs_invites.AcceptInput, info models.Info) (any, error) {
	var query = `
		select * from invites_accept($1, $2, $3);
	`
	var member pb.Member
	if err := app.Managers.DatabaseManager().Db.QueryRow(
		context.Background(), query, info.UserId, input.InviteId, info.UserOrigin,
	).Scan(&member.Id, &member.UserId, &member.SpaceId, &member.UserOrigin); err != nil {
		utils.Log(5, err)
		return &pb.InviteAcceptOutput{}, err
	}
	member.Origin = app.AppId
	var query2 = `
		select creator_id from space where id = $1;
	`
	var creatorId int64
	if err2 := app.Managers.DatabaseManager().Db.QueryRow(
		context.Background(), query2, member.SpaceId,
	).Scan(&creatorId); err2 != nil {
		utils.Log(5, err2)
		return &pb.InviteAcceptOutput{}, err2
	}
	app.Managers.PushManager().JoinGroup(member.SpaceId, member.UserId, member.UserOrigin)
	app.Managers.MemoryManager().Put(fmt.Sprintf(memberTemplate, member.SpaceId, member.UserId, member.UserOrigin), "true")
	var invite = pb.Invite{Id: input.InviteId, Origin: member.Origin, UserOrigin: member.UserOrigin, UserId: member.UserId, SpaceId: member.SpaceId}
	go app.Managers.PushManager().PushToUser("invites/accept", creatorId, member.Origin, updates_invites.Accept{Invite: &invite}, "", false)
	return &pb.InviteAcceptOutput{Member: &member}, nil
}

func declineInvite(app *runtime.App, input inputs_invites.DeclineInput, info models.Info) (any, error) {
	var query = `
		delete from invite where id = $1 and human_id = $2
		returning id, human_id, space_id, user_origin, origin
	`
	var invite pb.Invite
	if err := app.Managers.DatabaseManager().Db.QueryRow(
		context.Background(), query, input.InviteId, info.UserId,
	).Scan(&invite.Id, &invite.UserId, &invite.SpaceId, &invite.UserOrigin, &invite.Origin); err != nil {
		utils.Log(5, err)
		return &pb.InviteDeclineOutput{}, err
	}
	var query2 = `
		select creator_id from space where id = $1;
	`
	var creatorId int64
	if err2 := app.Managers.DatabaseManager().Db.QueryRow(
		context.Background(), query2, invite.SpaceId,
	).Scan(&creatorId); err2 != nil {
		utils.Log(5, err2)
		return &pb.InviteAcceptOutput{}, err2
	}
	go app.Managers.PushManager().PushToUser("invites/decline", creatorId, invite.Origin, updates_invites.Decline{Invite: &invite}, "", false)
	return &pb.InviteDeclineOutput{}, nil
}

func CreateInviteService(app *runtime.App, coreAccess bool) {

	// Tables
	app.Managers.DatabaseManager().ExecuteSqlFile("core/managers/database/tables/invite.sql")

	// Functions
	app.Managers.DatabaseManager().ExecuteSqlFile("core/managers/database/functions/invites/accept.sql")

	// Methods
	app.Services.AddAction(runtime.CreateAction(
		app,
		"/invites/create",
		runtime.CreateCk(true, true, false),
		runtime.CreateAc(coreAccess, true, false, false, fiber.MethodPost),
		true,
		createInvite,
	))
	app.Services.AddAction(runtime.CreateAction(
		app,
		"/invites/cancel",
		runtime.CreateCk(true, true, false),
		runtime.CreateAc(coreAccess, true, false, false, fiber.MethodPost),
		true,
		cancelInvite,
	))
	app.Services.AddAction(runtime.CreateAction(
		app,
		"/invites/accept",
		runtime.CreateCk(true, false, false),
		runtime.CreateAc(coreAccess, true, false, false, fiber.MethodPost),
		true,
		acceptInvite,
	))
	app.Services.AddAction(runtime.CreateAction(
		app,
		"/invites/decline",
		runtime.CreateCk(true, false, false),
		runtime.CreateAc(coreAccess, true, false, false, fiber.MethodPost),
		true,
		declineInvite,
	))
}

func LoadInviteGrpcService(grpcServer *grpc.Server) {
	type server struct {
		pb.UnimplementedInviteServiceServer
	}
	pb.RegisterInviteServiceServer(grpcServer, &server{})
}
