package services

import (
	"context"
	"errors"
	"fmt"
	inputs_spaces "sigma/main/core/inputs/spaces"
	"sigma/main/core/models"
	"sigma/main/core/runtime"
	updates_spaces "sigma/main/core/updates/spaces"
	"sigma/main/core/utils"

	pb "sigma/main/core/models/grpc"

	"github.com/gofiber/fiber/v2"
	"google.golang.org/grpc"
)

const memberTemplate = "member::%d::%d::%s"

func createSpace(app *runtime.App, input inputs_spaces.CreateInput, info models.Info) (any, error) {
	var query = `
		select * from spaces_create($1, $2, $3, $4, $5)
	`
	var space pb.Space
	var member pb.Member
	if err := app.Managers.DatabaseManager().Db.QueryRow(
		context.Background(), query, info.UserId, input.Name, input.AvatarId, input.IsPublic, app.AppId,
	).Scan(&member.Id, &space.Id); err != nil {
		utils.Log(5, err)
		return &pb.SpaceCreateOutput{}, err
	}
	if space.Id > 0 {
		space.Name = input.Name
		space.AvatarId = input.AvatarId
		space.CreatorId = info.UserId
		space.IsPublic = input.IsPublic
		space.Origin = app.AppId
		member.SpaceId = space.Id
		member.UserId = info.UserId
		member.Origin = app.AppId
		member.UserOrigin = app.AppId
	}
	app.Managers.PushManager().JoinGroup(member.SpaceId, member.UserId, member.UserOrigin)
	app.Managers.MemoryManager().Put(fmt.Sprintf(memberTemplate, member.SpaceId, member.UserId, member.UserOrigin), "true")
	return &pb.SpaceCreateOutput{Space: &space, Member: &member}, nil
}

func updateSpace(app *runtime.App, input inputs_spaces.UpdateInput, info models.Info) (any, error) {
	var query = `
		update space set name = $1, avatar_id = $2, is_public = $3 where id = $4 and creator_id = $5
		returning id, name, avatar_id, is_public, creator_id, origin;
	`
	var space pb.Space
	if err := app.Managers.DatabaseManager().Db.QueryRow(
		context.Background(), query, input.Name, input.AvatarId, input.IsPublic, input.SpaceId, info.UserId,
	).Scan(&space.Id, &space.Name, &space.AvatarId, &space.IsPublic, &space.CreatorId, &space.Origin); err != nil {
		utils.Log(5, err)
		return &pb.SpaceUpdateOutput{}, err
	}
	go app.Managers.PushManager().PushToGroup("spaces/update", space.Id, updates_spaces.Update{Space: &space},
		[]models.GroupMember{
			{UserId: info.UserId, UserOrigin: info.UserOrigin},
		})
	return &pb.SpaceUpdateOutput{Space: &space}, nil
}

func deleteSpace(app *runtime.App, input inputs_spaces.DeleteInput, info models.Info) (any, error) {
	var query = ``
	query = `
		delete from space where id = $1 and creator_id = $2
		returning id, name, avatar_id, creator_id;
	`
	var space pb.Space
	if err := app.Managers.DatabaseManager().Db.QueryRow(context.Background(), query, input.SpaceId, info.UserId).Scan(&space.Id, &space.Name, &space.AvatarId, &space.CreatorId); err != nil {
		utils.Log(5, err)
		return &pb.SpaceDeleteOutput{}, err
	}
	go app.Managers.PushManager().PushToGroup("spaces/delete", space.Id, updates_spaces.Delete{Space: &space},
		[]models.GroupMember{
			{UserId: info.UserId, UserOrigin: info.UserOrigin},
		})
	return &pb.SpaceDeleteOutput{}, nil
}

func getSpace(app *runtime.App, input inputs_spaces.GetInput, info models.Info) (any, error) {
	var query = `
		select * from spaces_get($1, $2)
	`
	var space pb.Space
	if err := app.Managers.DatabaseManager().Db.QueryRow(
		context.Background(), query, info.UserId, input.SpaceId,
	).Scan(&space.Id, &space.Name, &space.AvatarId, &space.IsPublic, &space.Origin); err != nil {
		utils.Log(5, err)
		return &pb.SpaceGetOutput{}, err
	}
	if space.IsPublic {
		return &pb.SpaceGetOutput{Space: &space}, nil
	} else {
		if app.Managers.MemoryManager().Get(fmt.Sprintf(memberTemplate, input.SpaceId, info.UserId, info.UserOrigin)) == "true" {
			return &pb.SpaceGetOutput{Space: &space}, nil
		} else {
			return &pb.SpaceGetOutput{}, errors.New("access denied")
		}
	}
}

func joinSpace(app *runtime.App, input inputs_spaces.JoinInput, info models.Info) (any, error) {
	userOrigin := info.UserOrigin
	if userOrigin == "" {
		userOrigin = app.AppId
	}
	var query = `
		select * from spaces_join($1, $2, $3, $4)
	`
	var member pb.Member
	if err := app.Managers.DatabaseManager().Db.QueryRow(
		context.Background(), query, info.UserId, input.SpaceId, app.AppId, userOrigin,
	).Scan(&member.Id, &member.UserId, &member.SpaceId); err != nil {
		utils.Log(5, err)
		return &pb.SpaceJoinOutput{}, err
	}
	member.Origin = app.AppId
	member.UserOrigin = userOrigin
	app.Managers.PushManager().JoinGroup(member.SpaceId, member.UserId, member.UserOrigin)
	app.Managers.MemoryManager().Put(fmt.Sprintf(memberTemplate, member.SpaceId, member.UserId, member.UserOrigin), "true")
	go app.Managers.PushManager().PushToGroup("spaces/join", member.SpaceId, updates_spaces.Join{Member: &member},
		[]models.GroupMember{
			{UserId: member.UserId, UserOrigin: member.UserOrigin},
		})
	return &pb.SpaceJoinOutput{Member: &member}, nil
}

func CreateSpaceService(app *runtime.App, coreAccess bool) {

	// Tables
	app.Managers.DatabaseManager().ExecuteSqlFile("core/managers/database/tables/space.sql")
	app.Managers.DatabaseManager().ExecuteSqlFile("core/managers/database/tables/member.sql")

	// Functions
	app.Managers.DatabaseManager().ExecuteSqlFile("core/managers/database/functions/spaces/join.sql")
	app.Managers.DatabaseManager().ExecuteSqlFile("core/managers/database/functions/spaces/get.sql")
	app.Managers.DatabaseManager().ExecuteSqlFile("core/managers/database/functions/spaces/create.sql")

	// Methods
	app.Services.AddAction(runtime.CreateAction(
		app,
		"/spaces/create",
		runtime.CreateCk(true, false, false),
		runtime.CreateAc(coreAccess, true, false, false, fiber.MethodPost),
		true,
		createSpace,
	))
	app.Services.AddAction(runtime.CreateAction(
		app,
		"/spaces/update",
		runtime.CreateCk(true, false, false),
		runtime.CreateAc(coreAccess, true, false, false, fiber.MethodPut),
		true,
		updateSpace,
	))
	app.Services.AddAction(runtime.CreateAction(
		app,
		"/spaces/delete",
		runtime.CreateCk(true, false, false),
		runtime.CreateAc(coreAccess, true, false, false, fiber.MethodDelete),
		true,
		deleteSpace,
	))
	app.Services.AddAction(runtime.CreateAction(
		app,
		"/spaces/get",
		runtime.CreateCk(true, false, false),
		runtime.CreateAc(coreAccess, true, false, false, fiber.MethodGet),
		true,
		getSpace,
	))
	app.Services.AddAction(runtime.CreateAction(
		app,
		"/spaces/join",
		runtime.CreateCk(true, false, false),
		runtime.CreateAc(coreAccess, true, false, false, fiber.MethodPost),
		true,
		joinSpace,
	))
}

func LoadSpaceGrpcService(grpcServer *grpc.Server) {
	type server struct {
		pb.UnimplementedSpaceServiceServer
	}
	pb.RegisterSpaceServiceServer(grpcServer, &server{})
}
