package services

import (
	"context"
	"errors"
	"fmt"
	"log"
	dtos_invites "sigma/main/core/dtos/invites"
	"sigma/main/core/modules"
	updates_invites "sigma/main/core/updates/invites"
	"sigma/main/shell/manager"

	pb "sigma/main/core/models/grpc"

	"github.com/gofiber/fiber/v2"
	"google.golang.org/grpc"
)

func createInvite(app *modules.App, input dtos_invites.CreateDto, assistant modules.Assistant) (any, error) {
	var query0 = `
		select id from tower where id = $1;
	`
	var towerId int64
	if err0 := app.Database.Db.QueryRow(
		context.Background(), query0, assistant.TowerId,
	).Scan(&towerId); err0 != nil {
		log.Println(err0)
		return &pb.InviteCreateOutput{}, errors.New("tower not found")
	}
	ro := input.RecepientOrigin
	if ro == "" {
		ro = app.AppId
	}
	var query = `
		insert into invite
		(
			human_id,
			tower_id,
			origin,
			user_origin
		) values ($1, $2, $3, $4)
		returning id, human_id, tower_id;
	`
	var invite pb.Invite
	if err := app.Database.Db.QueryRow(
		context.Background(), query, input.HumanId, assistant.TowerId, app.AppId, ro,
	).Scan(&invite.Id, &invite.HumanId, &invite.TowerId); err != nil {
		log.Println(err)
		return &pb.InviteCreateOutput{}, err
	}
	invite.Origin = app.AppId
	invite.UserOrigin = ro
	go app.Network.PusherServer.PushToUser("invites/create", input.HumanId, ro, updates_invites.Create{Invite: &invite}, "", false)
	return &pb.InviteCreateOutput{Invite: &invite}, nil
}

func cancelInvite(app *modules.App, input dtos_invites.CancelDto, assistant modules.Assistant) (any, error) {
	var query = `
		delete from invite where id = $1 and tower_id = $2
		returning id, human_id, tower_id, user_origin;
	`
	var invite pb.Invite
	if err := app.Database.Db.QueryRow(
		context.Background(), query, input.InviteId, assistant.TowerId,
	).Scan(&invite.Id, &invite.HumanId, &invite.TowerId, &invite.UserOrigin); err != nil {
		log.Println(err)
		return &pb.InviteCancelOutput{}, err
	}
	go app.Network.PusherServer.PushToUser("invites/cancel", invite.HumanId, invite.UserOrigin, updates_invites.Cancel{Invite: &invite}, "", false)
	return &pb.InviteCancelOutput{}, nil
}

func acceptInvite(app *modules.App, input dtos_invites.AcceptDto, assistant modules.Assistant) (any, error) {
	var query = `
		select * from invites_accept($1, $2, $3);
	`
	var member pb.Member
	if err := app.Database.Db.QueryRow(
		context.Background(), query, assistant.UserId, input.InviteId, assistant.UserOrigin,
	).Scan(&member.Id, &member.HumanId, &member.TowerId, &member.UserOrigin); err != nil {
		log.Println(err)
		return &pb.InviteAcceptOutput{}, err
	}
	member.Origin = app.AppId
	var query2 = `
		select creator_id from tower where id = $1;
	`
	var creatorId int64
	if err2 := app.Database.Db.QueryRow(
		context.Background(), query2, member.TowerId,
	).Scan(&creatorId); err2 != nil {
		log.Println(err2)
		return &pb.InviteAcceptOutput{}, err2
	}
	app.Network.PusherServer.JoinGroup(member.TowerId, member.HumanId, member.UserOrigin)
	app.Memory.Put(fmt.Sprintf(memberTemplate, member.TowerId, member.HumanId, member.UserOrigin), "true")
	var invite = pb.Invite{Id: input.InviteId, Origin: member.Origin, UserOrigin: member.UserOrigin, HumanId: member.HumanId, TowerId: member.TowerId}
	go app.Network.PusherServer.PushToUser("invites/accept", creatorId, member.Origin, updates_invites.Accept{Invite: &invite}, "", false)
	return &pb.InviteAcceptOutput{Member: &member}, nil
}

func declineInvite(app *modules.App, input dtos_invites.DeclineDto, assistant modules.Assistant) (any, error) {
	var query = `
		delete from invite where id = $1 and human_id = $2
		returning id, human_id, tower_id, user_origin, origin
	`
	var invite pb.Invite
	if err := app.Database.Db.QueryRow(
		context.Background(), query, input.InviteId, assistant.UserId,
	).Scan(&invite.Id, &invite.HumanId, &invite.TowerId, &invite.UserOrigin, &invite.Origin); err != nil {
		log.Println(err)
		return &pb.InviteDeclineOutput{}, err
	}
	var query2 = `
		select creator_id from tower where id = $1;
	`
	var creatorId int64
	if err2 := app.Database.Db.QueryRow(
		context.Background(), query2, invite.TowerId,
	).Scan(&creatorId); err2 != nil {
		log.Println(err2)
		return &pb.InviteAcceptOutput{}, err2
	}
	go app.Network.PusherServer.PushToUser("invites/decline", creatorId, invite.Origin, updates_invites.Decline{Invite: &invite}, "", false)
	return &pb.InviteDeclineOutput{}, nil
}

func CreateInviteService(app *modules.App, coreAccess bool) {

	// Tables
	app.Database.ExecuteSqlFile("core/database/tables/invite.sql")

	// Functions
	app.Database.ExecuteSqlFile("core/database/functions/invites/accept.sql")

	// Methods
	manager.Instance.Endpoint(modules.CreateAction(
		"/invites/create",
		fiber.MethodPost,
		modules.CreateCk(true, true, false),
		modules.CreateAc(coreAccess, true, false, false),
		true,
		createInvite,
	))
	manager.Instance.Endpoint(modules.CreateAction(
		"/invites/cancel",
		fiber.MethodPost,
		modules.CreateCk(true, true, false),
		modules.CreateAc(coreAccess, true, false, false),
		true,
		cancelInvite,
	))
	manager.Instance.Endpoint(modules.CreateAction(
		"/invites/accept",
		fiber.MethodPost,
		modules.CreateCk(true, false, false),
		modules.CreateAc(coreAccess, true, false, false),
		true,
		acceptInvite,
	))
	manager.Instance.Endpoint(modules.CreateAction(
		"/invites/decline",
		fiber.MethodPost,
		modules.CreateCk(true, false, false),
		modules.CreateAc(coreAccess, true, false, false),
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