package services

import (
	"context"
	"errors"
	"fmt"
	"sigma/main/core/modules"
	dtos_towers "sigma/main/shell/dtos/towers"
	updates_towers "sigma/main/shell/updates/towers"

	pb "sigma/main/shell/grpc"

	"github.com/gofiber/fiber/v2"
	"google.golang.org/grpc"
)

func createTower(app *modules.App, input dtos_towers.CreateDto, assistant modules.Assistant) (any, error) {
	var query = `
		select * from towers_create($1, $2, $3, $4, $5)
	`
	var tower pb.Tower
	var member pb.Member
	if err := app.Database.Db.QueryRow(
		context.Background(), query, assistant.UserId, input.Name, input.AvatarId, input.IsPublic, app.AppId,
	).Scan(&member.Id, &tower.Id); err != nil {
		fmt.Println(err)
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
	}
	app.Memory.Put(fmt.Sprintf("member::%d::%d", member.TowerId, member.HumanId), "true")
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
		fmt.Println(err)
		return &pb.TowerUpdateOutput{}, err
	}
	go app.Network.PusherServer.PushToGroup(tower.Id, updates_towers.Update{Tower: &tower}, []int64{})
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
		fmt.Println(err)
		return &pb.TowerDeleteOutput{}, err
	}
	go app.Network.PusherServer.PushToGroup(tower.Id, updates_towers.Delete{Tower: &tower}, []int64{})
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
		fmt.Println(err)
		return &pb.TowerGetOutput{}, err
	}
	if tower.IsPublic {
		return &pb.TowerGetOutput{Tower: &tower}, nil
	} else {
		if app.Memory.Get(fmt.Sprintf("member::%d::%d", input.TowerId, assistant.UserId)) == "true" {
			return &pb.TowerGetOutput{Tower: &tower}, nil
		} else {
			return &pb.TowerGetOutput{}, errors.New("access denied")
		}
	}
}

func joinTower(app *modules.App, input dtos_towers.JoinDto, assistant modules.Assistant) (any, error) {
	fmt.Println(assistant)
	var query = `
		select * from towers_join($1, $2, $3)
	`
	var member pb.Member
	if err := app.Database.Db.QueryRow(
		context.Background(), query, assistant.UserId, input.TowerId, app.AppId,
	).Scan(&member.Id, &member.HumanId, &member.TowerId); err != nil {
		fmt.Println(err)
		return &pb.TowerJoinOutput{}, err
	}
	member.Origin = app.AppId
	app.Network.PusherServer.JoinGroup(member.TowerId, member.HumanId)
	app.Memory.Put(fmt.Sprintf("member::%d::%d", member.TowerId, member.HumanId), "true")
	go app.Network.PusherServer.PushToGroup(member.TowerId, updates_towers.Join{Member: &member}, []int64{member.HumanId})
	return &pb.TowerJoinOutput{Member: &member}, nil
}

func CreateTowerService(app *modules.App) {

	// Tables
	app.Database.ExecuteSqlFile("shell/database/tables/tower.sql")
	app.Database.ExecuteSqlFile("shell/database/tables/member.sql")

	// Functions
	app.Database.ExecuteSqlFile("shell/database/functions/towers/join.sql")
	app.Database.ExecuteSqlFile("shell/database/functions/towers/get.sql")
	app.Database.ExecuteSqlFile("shell/database/functions/towers/create.sql")

	// Methods
	modules.AddMethod(
		app,
		modules.CreateMethod[dtos_towers.CreateDto, dtos_towers.CreateDto](
			"/towers/create",
			createTower,
			dtos_towers.CreateDto{},
			modules.CreateCheck(true, false, false),
			modules.CreateMethodOptions(true, fiber.MethodPost, true, false),
		),
	)
	modules.AddMethod(
		app,
		modules.CreateMethod[dtos_towers.UpdateDto, dtos_towers.UpdateDto](
			"/towers/update",
			updateTower,
			dtos_towers.UpdateDto{},
			modules.CreateCheck(true, true, false),
			modules.CreateMethodOptions(true, fiber.MethodPut, true, false),
		),
	)
	modules.AddMethod(
		app,
		modules.CreateMethod[dtos_towers.DeleteDto, dtos_towers.DeleteDto](
			"/towers/delete",
			deleteTower,
			dtos_towers.DeleteDto{},
			modules.CreateCheck(true, true, false),
			modules.CreateMethodOptions(true, fiber.MethodDelete, true, false),
		),
	)
	modules.AddMethod(
		app,
		modules.CreateMethod[dtos_towers.GetDto, dtos_towers.GetDto](
			"/towers/get",
			getTower,
			dtos_towers.GetDto{},
			modules.CreateCheck(true, false, false),
			modules.CreateMethodOptions(true, fiber.MethodGet, true, true),
		),
	)
	modules.AddMethod(
		app,
		modules.CreateMethod[dtos_towers.JoinDto, dtos_towers.JoinDto](
			"/towers/join",
			joinTower,
			dtos_towers.JoinDto{},
			modules.CreateCheck(true, false, false),
			modules.CreateMethodOptions(true, fiber.MethodPost, true, true),
		),
	)
}

func LoadTowerGrpcService(grpcServer *grpc.Server) {
	type server struct {
		pb.UnimplementedTowerServiceServer
	}
	pb.RegisterTowerServiceServer(grpcServer, &server{})
}
