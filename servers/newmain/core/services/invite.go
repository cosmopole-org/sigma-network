package services

import (
	"context"
	"fmt"
	"sigma/main/core/modules"
	updates_invites "sigma/main/core/updates/invites"

	pb "sigma/main/core/grpc"
)

func createInvite(app *modules.App, dto interface{}, assistant modules.Assistant) (any, error) {
	var input = (dto).(*pb.InviteCreateDto)
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

func cancelInvite(app *modules.App, dto interface{}, assistant modules.Assistant) (any, error) {
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
	go app.Network.PusherServer.PushToUser(invite.HumanId, updates_invites.Cancel{Invite: &invite}, false)
	return &pb.InviteCancelOutput{}, nil
}

func acceptInvite(app *modules.App, dto interface{}, assistant modules.Assistant) (any, error) {
	var input = (dto).(*pb.InviteAcceptDto)
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

func declineInvite(app *modules.App, dto interface{}, assistant modules.Assistant) (any, error) {
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
	go app.Network.PusherServer.PushToUser(invite.HumanId, updates_invites.Decline{Invite: &invite}, false)
	return &pb.InviteDeclineOutput{}, nil
}

func CreateInviteService(app *modules.App) {

	// // Tables
	// app.Database.ExecuteSqlFile("core/database/tables/invite.sql")

	// // Functions
	// app.Database.ExecuteSqlFile("core/database/functions/invites/accept.sql")

	// var s = modules.CreateService(app, "sigma.InviteService")
	// s.AddGrpcLoader(func() {
	// 	type server struct {
	// 		pb.UnimplementedInviteServiceServer
	// 	}
	// 	pb.RegisterInviteServiceServer(app.Network.GrpcServer, &server{})
	// })
	// s.AddMethod(modules.CreateMethod("create", createInvite, modules.CreateCheck(true, true, false), pb.InviteCreateDto{}, modules.CreateMethodOptions(true, true, false)))
	// s.AddMethod(modules.CreateMethod("cancel", cancelInvite, modules.CreateCheck(true, true, false), pb.InviteCancelDto{}, modules.CreateMethodOptions(true, true, false)))
	// s.AddMethod(modules.CreateMethod("accept", acceptInvite, modules.CreateCheck(true, false, false), pb.InviteAcceptDto{}, modules.CreateMethodOptions(true, true, false)))
	// s.AddMethod(modules.CreateMethod("decline", declineInvite, modules.CreateCheck(true, false, false), pb.InviteDeclineDto{}, modules.CreateMethodOptions(true, true, false)))

	//return s
}
