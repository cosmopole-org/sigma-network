package services

import (
	"context"
	"fmt"
	"sigma/main/core/interfaces"
	"sigma/main/core/types"
	updates_towers "sigma/main/core/updates/towers"
	"sigma/main/core/utils"
	"strconv"

	pb "sigma/main/core/grpc"
)

func createTower(app interfaces.IApp, dto interface{}, assistant interfaces.IAssistant) (any, error) {
	var input = (dto).(*pb.TowerCreateDto)
	var query = `
		select * from towers_create($1, $2, $3, $4)
	`
	var tower pb.Tower
	var member pb.Member
	if err := app.GetDatabase().GetDb().QueryRow(
		context.Background(), query, assistant.GetUserId(), input.Name, input.AvatarId, input.IsPublic,
	).Scan(&member.Id, &tower.Id); err != nil {
		fmt.Println(err)
		return &pb.TowerCreateOutput{}, err
	}
	if tower.Id > 0 {
		tower.Name = input.Name
		tower.AvatarId = input.AvatarId
		tower.CreatorId = assistant.GetUserId()
		tower.IsPublic = input.IsPublic
		member.TowerId = tower.Id
		member.HumanId = assistant.GetUserId()
	}
	app.GetMemory().Put(fmt.Sprintf("member::%d::%d", member.TowerId, member.HumanId), "true")
	return &pb.TowerCreateOutput{Tower: &tower, Member: &member}, nil
}

func updateTower(app interfaces.IApp, dto interface{}, assistant interfaces.IAssistant) (any, error) {
	var input = (dto).(*pb.TowerUpdateDto)
	var query = `
		update tower set name = $1, avatar_id = $2, is_public = $3 where id = $4 and creator_id = $5
		returning id, name, avatar_id, is_public, creator_id;
	`
	var tower pb.Tower
	if err := app.GetDatabase().GetDb().QueryRow(
		context.Background(), query, input.Name, input.AvatarId, input.IsPublic, input.TowerId, assistant.GetUserId(),
	).Scan(&tower.Id, &tower.Name, &tower.AvatarId, &tower.IsPublic, &tower.CreatorId); err != nil {
		fmt.Println(err)
		return &pb.TowerUpdateOutput{}, err
	}
	go app.GetNetwork().GetPusherServer().PushToGroup(tower.Id, updates_towers.Update{Tower: &tower}, []int64{})
	return &pb.TowerUpdateOutput{Tower: &tower}, nil
}

func deleteTower(app interfaces.IApp, dto interface{}, assistant interfaces.IAssistant) (any, error) {
	var input = (dto).(*pb.TowerDeleteDto)
	var query = ``
	query = `
		delete from tower where id = $1 and creator_id = $2
		returning id, name, avatar_id, creator_id;
	`
	var tower pb.Tower
	if err := app.GetDatabase().GetDb().QueryRow(context.Background(), query, input.TowerId, assistant.GetUserId()).Scan(&tower.Id, &tower.Name, &tower.AvatarId, &tower.CreatorId); err != nil {
		fmt.Println(err)
		return &pb.TowerDeleteOutput{}, err
	}
	go app.GetNetwork().GetPusherServer().PushToGroup(tower.Id, updates_towers.Delete{Tower: &tower}, []int64{})
	return &pb.TowerDeleteOutput{}, nil
}

func getTower(app interfaces.IApp, dto interface{}, assistant interfaces.IAssistant) (any, error) {
	var input = (dto).(*pb.TowerGetDto)
	var query = `
		select * from towers_get($1, $2)
	`
	var tower pb.Tower
	towerId, err := strconv.ParseInt(input.TowerId, 10, 64)
	if err != nil {
		fmt.Println(err)
		return &pb.TowerGetOutput{}, err
	}
	if err := app.GetDatabase().GetDb().QueryRow(
		context.Background(), query, assistant.GetUserId(), towerId,
	).Scan(&tower.Id, &tower.Name, &tower.AvatarId, &tower.IsPublic); err != nil {
		fmt.Println(err)
		return &pb.TowerGetOutput{}, err
	}
	return &pb.TowerGetOutput{Tower: &tower}, nil
}

func joinTower(app interfaces.IApp, dto interface{}, assistant interfaces.IAssistant) (any, error) {
	var input = (dto).(*pb.TowerJoinDto)
	fmt.Println(assistant)
	var query = `
		select * from towers_join($1, $2)
	`
	var member pb.Member
	if err := app.GetDatabase().GetDb().QueryRow(
		context.Background(), query, assistant.GetUserId(), input.TowerId,
	).Scan(&member.Id, &member.HumanId, &member.TowerId); err != nil {
		fmt.Println(err)
		return &pb.TowerJoinOutput{}, err
	}
	app.GetNetwork().GetPusherServer().JoinGroup(member.TowerId, member.HumanId)
	app.GetMemory().Put(fmt.Sprintf("member::%d::%d", member.TowerId, member.HumanId), "true")
	go app.GetNetwork().GetPusherServer().PushToGroup(member.TowerId, updates_towers.Join{Member: &member}, []int64{member.HumanId})
	return &pb.TowerJoinOutput{Member: &member}, nil
}

func CreateTowerService(app interfaces.IApp) interfaces.IService {

	// Tables
	utils.ExecuteSqlFile("core/database/tables/tower.sql")
	utils.ExecuteSqlFile("core/database/tables/member.sql")

	// Functions
	utils.ExecuteSqlFile("core/database/functions/towers/join.sql")
	utils.ExecuteSqlFile("core/database/functions/towers/get.sql")
	utils.ExecuteSqlFile("core/database/functions/towers/create.sql")

	var s = types.CreateService(app, "sigma.TowerService")
	s.AddGrpcLoader(func() {
		type server struct {
			pb.UnimplementedTowerServiceServer
		}
		pb.RegisterTowerServiceServer(app.GetNetwork().GetGrpcServer(), &server{})
	})
	s.AddMethod(types.CreateMethod("create", createTower, types.CreateCheck(true, false, false), pb.TowerCreateDto{}, types.CreateMethodOptions(true, true)))
	s.AddMethod(types.CreateMethod("update", updateTower, types.CreateCheck(true, false, false), pb.TowerUpdateDto{}, types.CreateMethodOptions(true, true)))
	s.AddMethod(types.CreateMethod("delete", deleteTower, types.CreateCheck(true, false, false), pb.TowerDeleteDto{}, types.CreateMethodOptions(true, true)))
	s.AddMethod(types.CreateMethod("get", getTower, types.CreateCheck(true, false, false), pb.TowerGetDto{}, types.CreateMethodOptions(true, true)))
	s.AddMethod(types.CreateMethod("join", joinTower, types.CreateCheck(true, false, false), pb.TowerJoinDto{}, types.CreateMethodOptions(true, true)))

	return s
}
