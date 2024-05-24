package services

import (
	"context"
	"errors"
	"fmt"
	dtos_towers "sigma/admin/core/dtos/towers"
	"sigma/admin/core/modules"
	updates_towers "sigma/admin/core/updates/towers"
	"sigma/admin/core/utils"

	pb "sigma/admin/core/models/grpc"

	"github.com/gofiber/fiber/v2"
	"google.golang.org/grpc"
)

const memberTemplate = "member::%d::%d::%s"

func createTower(app *modules.App, input dtos_towers.CreateDto, assistant modules.Assistant) (any, error) {
	var query = `
		select * from towers_create($1, $2, $3, $4, $5)
	`
	var tower pb.Tower
	var member pb.Member
	if err := app.Database.Db.QueryRow(
		context.Background(), query, assistant.UserId, input.Name, input.AvatarId, input.IsPublic, app.AppId,
	).Scan(&member.Id, &tower.Id); err != nil {
		utils.Log(5, err)
		return &pb.TowerCreateOutput{}, err
	}
	if tower.Id > 0 {
		tower.Name = input.Name
		tower.AvatarId = input.AvatarId
		tower.CreatorId = assistant.UserId
		tower.IsPublic = input.IsPublic
		tower.Origin = app.AppId
		member.TowerId = tower.Id
		member.HumanId = assistant.UserId
		member.Origin = app.AppId
		member.UserOrigin = app.AppId
	}
	app.Pusher.JoinGroup(member.TowerId, member.HumanId, member.UserOrigin)
	app.Memory.Put(fmt.Sprintf(memberTemplate, member.TowerId, member.HumanId, member.UserOrigin), "true")
	return &pb.TowerCreateOutput{Tower: &tower, Member: &member}, nil
}

func updateTower(app *modules.App, input dtos_towers.UpdateDto, assistant modules.Assistant) (any, error) {
	var query = `
		update tower set name = $1, avatar_id = $2, is_public = $3 where id = $4 and creator_id = $5
		returning id, name, avatar_id, is_public, creator_id, origin;
	`
	var tower pb.Tower
	if err := app.Database.Db.QueryRow(
		context.Background(), query, input.Name, input.AvatarId, input.IsPublic, input.TowerId, assistant.UserId,
	).Scan(&tower.Id, &tower.Name, &tower.AvatarId, &tower.IsPublic, &tower.CreatorId, &tower.Origin); err != nil {
		utils.Log(5, err)
		return &pb.TowerUpdateOutput{}, err
	}
	go app.Pusher.PushToGroup("towers/update", tower.Id, updates_towers.Update{Tower: &tower},
		[]modules.GroupMember{
			{UserId: assistant.UserId, UserOrigin: assistant.UserOrigin},
		})
	return &pb.TowerUpdateOutput{Tower: &tower}, nil
}

func deleteTower(app *modules.App, input dtos_towers.DeleteDto, assistant modules.Assistant) (any, error) {
	var query = ``
	query = `
		delete from tower where id = $1 and creator_id = $2
		returning id, name, avatar_id, creator_id;
	`
	var tower pb.Tower
	if err := app.Database.Db.QueryRow(context.Background(), query, input.TowerId, assistant.UserId).Scan(&tower.Id, &tower.Name, &tower.AvatarId, &tower.CreatorId); err != nil {
		utils.Log(5, err)
		return &pb.TowerDeleteOutput{}, err
	}
	go app.Pusher.PushToGroup("towers/delete", tower.Id, updates_towers.Delete{Tower: &tower},
		[]modules.GroupMember{
			{UserId: assistant.UserId, UserOrigin: assistant.UserOrigin},
		})
	return &pb.TowerDeleteOutput{}, nil
}

func getTower(app *modules.App, input dtos_towers.GetDto, assistant modules.Assistant) (any, error) {
	var query = `
		select * from towers_get($1, $2)
	`
	var tower pb.Tower
	if err := app.Database.Db.QueryRow(
		context.Background(), query, assistant.UserId, input.TowerId,
	).Scan(&tower.Id, &tower.Name, &tower.AvatarId, &tower.IsPublic, &tower.Origin); err != nil {
		utils.Log(5, err)
		return &pb.TowerGetOutput{}, err
	}
	if tower.IsPublic {
		return &pb.TowerGetOutput{Tower: &tower}, nil
	} else {
		if app.Memory.Get(fmt.Sprintf(memberTemplate, input.TowerId, assistant.UserId, assistant.UserOrigin)) == "true" {
			return &pb.TowerGetOutput{Tower: &tower}, nil
		} else {
			return &pb.TowerGetOutput{}, errors.New("access denied")
		}
	}
}

func joinTower(app *modules.App, input dtos_towers.JoinDto, assistant modules.Assistant) (any, error) {
	userOrigin := assistant.UserOrigin
	if userOrigin == "" {
		userOrigin = app.AppId
	}
	var query = `
		select * from towers_join($1, $2, $3, $4)
	`
	var member pb.Member
	if err := app.Database.Db.QueryRow(
		context.Background(), query, assistant.UserId, input.TowerId, app.AppId, userOrigin,
	).Scan(&member.Id, &member.HumanId, &member.TowerId); err != nil {
		utils.Log(5, err)
		return &pb.TowerJoinOutput{}, err
	}
	member.Origin = app.AppId
	member.UserOrigin = userOrigin
	app.Pusher.JoinGroup(member.TowerId, member.HumanId, member.UserOrigin)
	app.Memory.Put(fmt.Sprintf(memberTemplate, member.TowerId, member.HumanId, member.UserOrigin), "true")
	go app.Pusher.PushToGroup("towers/join", member.TowerId, updates_towers.Join{Member: &member},
		[]modules.GroupMember{
			{UserId: member.HumanId, UserOrigin: member.UserOrigin},
		})
	return &pb.TowerJoinOutput{Member: &member}, nil
}

func CreateTowerService(app *modules.App, coreAccess bool) {

	// Tables
	app.Database.ExecuteSqlFile("core/database/tables/tower.sql")
	app.Database.ExecuteSqlFile("core/database/tables/member.sql")

	// Functions
	app.Database.ExecuteSqlFile("core/database/functions/towers/join.sql")
	app.Database.ExecuteSqlFile("core/database/functions/towers/get.sql")
	app.Database.ExecuteSqlFile("core/database/functions/towers/create.sql")

	// Methods
	app.Services.AddAction(modules.CreateAction(
		app,
		"/towers/create",
		modules.CreateCk(true, false, false),
		modules.CreateAc(coreAccess, true, false, false, fiber.MethodPost),
		true,
		createTower,
	))
	app.Services.AddAction(modules.CreateAction(
		app,
		"/towers/update",
		modules.CreateCk(true, false, false),
		modules.CreateAc(coreAccess, true, false, false, fiber.MethodPut),
		true,
		updateTower,
	))
	app.Services.AddAction(modules.CreateAction(
		app,
		"/towers/delete",
		modules.CreateCk(true, false, false),
		modules.CreateAc(coreAccess, true, false, false, fiber.MethodDelete),
		true,
		deleteTower,
	))
	app.Services.AddAction(modules.CreateAction(
		app,
		"/towers/get",
		modules.CreateCk(true, false, false),
		modules.CreateAc(coreAccess, true, false, false, fiber.MethodGet),
		true,
		getTower,
	))
	app.Services.AddAction(modules.CreateAction(
		app,
		"/towers/join",
		modules.CreateCk(true, false, false),
		modules.CreateAc(coreAccess, true, false, false, fiber.MethodPost),
		true,
		joinTower,
	))
}

func LoadTowerGrpcService(grpcServer *grpc.Server) {
	type server struct {
		pb.UnimplementedTowerServiceServer
	}
	pb.RegisterTowerServiceServer(grpcServer, &server{})
}