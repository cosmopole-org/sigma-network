package services

import (
	"context"
	"fmt"
	dtos_towers "sigma/core/src/dtos/towers"
	"sigma/core/src/interfaces"
	"sigma/core/src/models"
	outputs_towers "sigma/core/src/outputs/towers"
	"sigma/core/src/types"
	updates_towers "sigma/core/src/updates/towers"
	"sigma/core/src/utils"
	"strconv"
)

func createTower(app interfaces.IApp, dto interface{}, assistant interfaces.IAssistant) (any, error) {
	var input = (dto).(*dtos_towers.CreateDto)
	var query = `
		select * from towers_create($1, $2, $3, $4)
	`
	var tower models.Tower
	var member models.Member
	if err := app.GetDatabase().GetDb().QueryRow(
		context.Background(), query, assistant.GetUserId(), input.Name, input.AvatarId, input.IsPublic,
	).Scan(&member.Id, &tower.Id); err != nil {
		fmt.Println(err)
		return outputs_towers.CreateOutput{}, err
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
	return outputs_towers.CreateOutput{Tower: tower, Member: member}, nil
}

func updateTower(app interfaces.IApp, dto interface{}, assistant interfaces.IAssistant) (any, error) {
	var input = (dto).(*dtos_towers.UpdateDto)
	var query = `
		update tower set name = $1, avatar_id = $2, is_public = $3 where id = $4 and creator_id = $5
		returning id, name, avatar_id, is_public, creator_id;
	`
	var tower models.Tower
	if err := app.GetDatabase().GetDb().QueryRow(
		context.Background(), query, input.Name, input.AvatarId, input.IsPublic, input.TowerId, assistant.GetUserId(),
	).Scan(&tower.Id, &tower.Name, &tower.AvatarId, &tower.IsPublic, &tower.CreatorId); err != nil {
		fmt.Println(err)
		return outputs_towers.UpdateOutput{}, err
	}
	go app.GetNetwork().GetPusherServer().PushToGroup(tower.Id, updates_towers.Update{Tower: tower}, []int64{})
	return outputs_towers.UpdateOutput{Tower: tower}, nil
}

func deleteTower(app interfaces.IApp, dto interface{}, assistant interfaces.IAssistant) (any, error) {
	var input = (dto).(*dtos_towers.DeleteDto)
	var query = ``
	query = `
		delete from tower where id = $1 and creator_id = $2
		returning id, name, avatar_id, creator_id;
	`
	var tower models.Tower
	if err := app.GetDatabase().GetDb().QueryRow(context.Background(), query, input.TowerId, assistant.GetUserId()).Scan(&tower.Id, &tower.Name, &tower.AvatarId, &tower.CreatorId); err != nil {
		fmt.Println(err)
		return outputs_towers.DeleteOutput{}, err
	}
	go app.GetNetwork().GetPusherServer().PushToGroup(tower.Id, updates_towers.Delete{Tower: tower}, []int64{})
	return outputs_towers.DeleteOutput{}, nil
}

func getTower(app interfaces.IApp, dto interface{}, assistant interfaces.IAssistant) (any, error) {
	var input = (dto).(*dtos_towers.GetDto)
	var query = `
		select * from towers_get($1, $2)
	`
	var tower models.Tower
	towerId, err := strconv.ParseInt(input.TowerId, 10, 64)
	if err != nil {
		fmt.Println(err)
		return outputs_towers.GetOutput{}, err
	}
	if err := app.GetDatabase().GetDb().QueryRow(
		context.Background(), query, assistant.GetUserId(), towerId,
	).Scan(&tower.Id, &tower.Name, &tower.AvatarId, &tower.IsPublic); err != nil {
		fmt.Println(err)
		return outputs_towers.GetOutput{}, err
	}
	return outputs_towers.GetOutput{Tower: tower}, nil
}

func joinTower(app interfaces.IApp, dto interface{}, assistant interfaces.IAssistant) (any, error) {
	var input = (dto).(*dtos_towers.JoinDto)
	fmt.Println(assistant)
	var query = `
		select * from towers_join($1, $2)
	`
	var member models.Member
	if err := app.GetDatabase().GetDb().QueryRow(
		context.Background(), query, assistant.GetUserId(), input.TowerId,
	).Scan(&member.Id, &member.HumanId, &member.TowerId); err != nil {
		fmt.Println(err)
		return outputs_towers.JoinOutput{}, err
	}
	app.GetNetwork().GetPusherServer().JoinGroup(member.TowerId, member.HumanId)
	app.GetMemory().Put(fmt.Sprintf("member::%d::%d", member.TowerId, member.HumanId), "true")
	go app.GetNetwork().GetPusherServer().PushToGroup(member.TowerId, updates_towers.Join{Member: member}, []int64{member.HumanId})
	return outputs_towers.JoinOutput{Member: member}, nil
}

func CreateTowerService(app interfaces.IApp) interfaces.IService {

	// Tables
	utils.ExecuteSqlFile("src/database/tables/tower.sql")
	utils.ExecuteSqlFile("src/database/tables/member.sql")

	// Functions
	utils.ExecuteSqlFile("src/database/functions/towers/join.sql")
	utils.ExecuteSqlFile("src/database/functions/towers/get.sql")
	utils.ExecuteSqlFile("src/database/functions/towers/create.sql")

	var s = types.CreateService(app, "towers")
	s.AddMethod(types.CreateMethod("create", createTower, types.CreateCheck(true, false, false), dtos_towers.CreateDto{}, types.CreateMethodOptions(true, false)))
	s.AddMethod(types.CreateMethod("update", updateTower, types.CreateCheck(true, false, false), dtos_towers.UpdateDto{}, types.CreateMethodOptions(true, false)))
	s.AddMethod(types.CreateMethod("delete", deleteTower, types.CreateCheck(true, false, false), dtos_towers.DeleteDto{}, types.CreateMethodOptions(true, false)))
	s.AddMethod(types.CreateMethod("get", getTower, types.CreateCheck(true, false, false), dtos_towers.GetDto{}, types.CreateMethodOptions(true, false)))
	s.AddMethod(types.CreateMethod("join", joinTower, types.CreateCheck(true, false, false), dtos_towers.JoinDto{}, types.CreateMethodOptions(true, false)))

	return s
}
