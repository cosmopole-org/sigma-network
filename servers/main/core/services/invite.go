package services

import (
	"context"
	"fmt"
	"sigma/main/core/types"
	updates_invites "sigma/main/core/updates/invites"

	pb "sigma/main/core/grpc"
)

func createInvite(app *types.App, dto interface{}, assistant types.Assistant) (any, error) {
	var input = (dto).(*pb.InviteCreateDto)
	var query = `
		insert into invite
		(
			human_id,
			tower_id
		) values ($1, $2)
		returning id, human_id, tower_id;
	`
	var invite pb.Invite
	if err := app.Database.Db.QueryRow(
		context.Background(), query, input.HumanId, assistant.TowerId,
	).Scan(&invite.Id, &invite.HumanId, &invite.TowerId); err != nil {
		fmt.Println(err)
		return &pb.InviteCreateOutput{}, err
	}
	go app.Network.PusherServer.PushToUser(input.HumanId, updates_invites.Create{Invite: &invite})
	return &pb.InviteCreateOutput{Invite: &invite}, nil
}

func cancelInvite(app *types.App, dto interface{}, assistant types.Assistant) (any, error) {
	var input = (dto).(*pb.InviteCancelDto)
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
	go app.Network.PusherServer.PushToUser(invite.HumanId, updates_invites.Cancel{Invite: &invite})
	return &pb.InviteCancelOutput{}, nil
}

func acceptInvite(app *types.App, dto interface{}, assistant types.Assistant) (any, error) {
	var input = (dto).(*pb.InviteAcceptDto)
	var query = `
		select * from invites_accept($1, $2)
	`
	var member pb.Member
	if err := app.Database.Db.QueryRow(
		context.Background(), query, assistant.UserId, input.InviteId,
	).Scan(&member.Id, &member.HumanId, &member.TowerId); err != nil {
		fmt.Println(err)
		return &pb.InviteAcceptOutput{}, err
	}
	var invite = pb.Invite{Id: input.InviteId, HumanId: member.HumanId, TowerId: member.TowerId}
	go app.Network.PusherServer.PushToUser(invite.HumanId, updates_invites.Accept{Invite: &invite})
	return &pb.InviteAcceptOutput{Member: &member}, nil
}

func declineInvite(app *types.App, dto interface{}, assistant types.Assistant) (any, error) {
	var input = (dto).(*pb.InviteDeclineDto)
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
	go app.Network.PusherServer.PushToUser(invite.HumanId, updates_invites.Decline{Invite: &invite})
	return &pb.InviteDeclineOutput{}, nil
}

func CreateInviteService(app *types.App) *types.Service {

	// Tables
	app.Database.ExecuteSqlFile("core/database/tables/invite.sql")

	// Functions
	app.Database.ExecuteSqlFile("core/database/functions/invites/accept.sql")

	var s = types.CreateService(app, "sigma.InviteService")
	s.AddGrpcLoader(func() {
		type server struct {
			pb.UnimplementedInviteServiceServer
		}
		pb.RegisterInviteServiceServer(app.Network.GrpcServer, &server{})
	})
	s.AddMethod(types.CreateMethod("create", createInvite, types.CreateCheck(true, true, false), pb.InviteCreateDto{}, types.CreateMethodOptions(true, false)))
	s.AddMethod(types.CreateMethod("cancel", cancelInvite, types.CreateCheck(true, true, false), pb.InviteCancelDto{}, types.CreateMethodOptions(true, false)))
	s.AddMethod(types.CreateMethod("accept", acceptInvite, types.CreateCheck(true, false, false), pb.InviteAcceptDto{}, types.CreateMethodOptions(true, false)))
	s.AddMethod(types.CreateMethod("decline", declineInvite, types.CreateCheck(true, false, false), pb.InviteDeclineDto{}, types.CreateMethodOptions(true, false)))

	return s
}
