package services

import (
	"context"
	"fmt"
	"sigma/main/core/modules"
	dtos_invites "sigma/main/shell/dtos/invites"
	updates_invites "sigma/main/shell/updates/invites"

	pb "sigma/main/shell/grpc"

	"github.com/gofiber/fiber/v2"
	"google.golang.org/grpc"
)

func createInvite(app *modules.App, input dtos_invites.CreateDto, assistant modules.Assistant) (any, error) {
	var query = `
		insert into invite
		(
			human_id,
			tower_id,
			origin
		) values ($1, $2, $3)
		returning id, human_id, tower_id;
	`
	var invite pb.Invite
	if err := app.Database.Db.QueryRow(
		context.Background(), query, input.HumanId, assistant.TowerId, app.AppId,
	).Scan(&invite.Id, &invite.HumanId, &invite.TowerId); err != nil {
		fmt.Println(err)
		return &pb.InviteCreateOutput{}, err
	}
	invite.Origin = app.AppId
	go app.Network.PusherServer.PushToUser(input.HumanId, updates_invites.Create{Invite: &invite}, false)
	return &pb.InviteCreateOutput{Invite: &invite}, nil
}

func cancelInvite(app *modules.App, input dtos_invites.CancelDto, assistant modules.Assistant) (any, error) {
	var query = `
		delete from invite where id = $1 and tower_id = $2
		returning id, human_id, tower_id;
	`
	var invite pb.Invite
	if err := app.Database.Db.QueryRow(
		context.Background(), query, input.InviteId, assistant.TowerId,
	).Scan(&invite.Id, &invite.HumanId, &invite.TowerId); err != nil {
		fmt.Println(err)
		return &pb.InviteCancelOutput{}, err
	}
	go app.Network.PusherServer.PushToUser(invite.HumanId, updates_invites.Cancel{Invite: &invite}, false)
	return &pb.InviteCancelOutput{}, nil
}

func acceptInvite(app *modules.App, input dtos_invites.AcceptDto, assistant modules.Assistant) (any, error) {
	var query = `
		select * from invites_accept($1, $2, $3);
	`
	var member pb.Member
	if err := app.Database.Db.QueryRow(
		context.Background(), query, assistant.UserId, input.InviteId, app.AppId,
	).Scan(&member.Id, &member.HumanId, &member.TowerId); err != nil {
		fmt.Println(err)
		return &pb.InviteAcceptOutput{}, err
	}
	member.Origin = app.AppId
	var invite = pb.Invite{Id: input.InviteId, HumanId: member.HumanId, TowerId: member.TowerId}
	go app.Network.PusherServer.PushToUser(invite.HumanId, updates_invites.Accept{Invite: &invite}, false)
	return &pb.InviteAcceptOutput{Member: &member}, nil
}

func declineInvite(app *modules.App, input dtos_invites.DeclineDto, assistant modules.Assistant) (any, error) {
	var query = `
		delete from invite where id = $1 and human_id = $2
		returning id, human_id, tower_id
	`
	var invite pb.Invite
	if err := app.Database.Db.QueryRow(
		context.Background(), query, input.InviteId, assistant.UserId,
	).Scan(&invite.Id, &invite.HumanId, &invite.TowerId); err != nil {
		fmt.Println(err)
		return &pb.InviteDeclineOutput{}, err
	}
	go app.Network.PusherServer.PushToUser(invite.HumanId, updates_invites.Decline{Invite: &invite}, false)
	return &pb.InviteDeclineOutput{}, nil
}

func CreateInviteService(app *modules.App) {

	// Tables
	app.Database.ExecuteSqlFile("shell/database/tables/invite.sql")

	// Functions
	app.Database.ExecuteSqlFile("shell/database/functions/invites/accept.sql")

	// Methods
	modules.AddMethod(
		app,
		modules.CreateMethod[dtos_invites.CreateDto, dtos_invites.CreateDto](
			"/invites/create",
			createInvite,
			dtos_invites.CreateDto{},
			modules.CreateCheck(true, true, false),
			modules.CreateMethodOptions(true, fiber.MethodPost, true, true),
			modules.CreateInterFedOptions(true, true),
		),
	)
	modules.AddMethod(
		app,
		modules.CreateMethod[dtos_invites.CancelDto, dtos_invites.CancelDto](
			"/invites/cancel",
			cancelInvite,
			dtos_invites.CancelDto{},
			modules.CreateCheck(true, true, false),
			modules.CreateMethodOptions(true, fiber.MethodPost, true, true),
			modules.CreateInterFedOptions(true, true),
		),
	)
	modules.AddMethod(
		app,
		modules.CreateMethod[dtos_invites.AcceptDto, dtos_invites.AcceptDto](
			"/invites/accept",
			acceptInvite,
			dtos_invites.AcceptDto{},
			modules.CreateCheck(true, false, false),
			modules.CreateMethodOptions(true, fiber.MethodPost, true, true),
			modules.CreateInterFedOptions(true, false),
		),
	)
	modules.AddMethod(
		app,
		modules.CreateMethod[dtos_invites.DeclineDto, dtos_invites.DeclineDto](
			"/invites/decline",
			declineInvite,
			dtos_invites.DeclineDto{},
			modules.CreateCheck(true, false, false),
			modules.CreateMethodOptions(true, fiber.MethodPost, true, true),
			modules.CreateInterFedOptions(true, false),
		),
	)
}

func LoadInviteGrpcService(grpcServer *grpc.Server) {
	type server struct {
		pb.UnimplementedInviteServiceServer
	}
	pb.RegisterInviteServiceServer(grpcServer, &server{})
}
