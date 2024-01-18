package services

import (
	"context"
	"fmt"
	dtos_towers "sigma/core/src/dtos/towers"
	"sigma/core/src/interfaces"
	"sigma/core/src/models"
	outputs_towers "sigma/core/src/outputs/towers"
	"sigma/core/src/types"
	"sigma/core/src/utils"
	"strconv"

	"github.com/valyala/fasthttp"
)

func createTower(app *interfaces.IApp, p interfaces.IPacket, dto interfaces.IDto, guard interfaces.IGuard) {
	var input = dto.(*dtos_towers.CreateDto)
	var packet = p.(types.WebPacket)
	var query = `
		insert into tower
		(
			name,
			avatar_id,
			is_public,
			creator_id
		) values ($1, $2, $3, $4)
		returning id, name, avatar_id, is_public, creator_id;
	`
	var tower models.Tower
	if err := (*app).GetDatabase().GetDb().QueryRow(
		context.Background(), query, input.Name, input.AvatarId, input.IsPublic, guard.GetUserId(),
	).Scan(&tower.Id, &tower.Name, &tower.AvatarId, &tower.IsPublic, &tower.CreatorId); err != nil {
		fmt.Println(err)
		packet.AnswerWithJson(fasthttp.StatusInternalServerError, map[string]string{}, utils.BuildErrorJson(err.Error()))
		return
	}
	packet.AnswerWithJson(fasthttp.StatusOK, map[string]string{}, outputs_towers.CreateOutput{Tower: tower})
}

func updateTower(app *interfaces.IApp, p interfaces.IPacket, dto interfaces.IDto, guard interfaces.IGuard) {
	var input = dto.(*dtos_towers.UpdateDto)
	var packet = p.(types.WebPacket)
	var query = `
		update tower set name = $1, avatar_id = $2, is_public = $3 where id = $4 and creator_id = $5
		returning id, name, avatar_id, is_public, creator_id;
	`
	var tower models.Tower
	if err := (*app).GetDatabase().GetDb().QueryRow(
		context.Background(), query, input.Name, input.AvatarId, input.IsPublic, input.TowerId, guard.GetUserId(),
	).Scan(&tower.Id, &tower.Name, &tower.AvatarId, &tower.IsPublic, &tower.CreatorId); err != nil {
		fmt.Println(err)
		packet.AnswerWithJson(fasthttp.StatusInternalServerError, map[string]string{}, utils.BuildErrorJson(err.Error()))
		return
	}
	packet.AnswerWithJson(fasthttp.StatusOK, map[string]string{}, outputs_towers.UpdateOutput{Tower: tower})
}

func deleteTower(app *interfaces.IApp, p interfaces.IPacket, dto interfaces.IDto, guard interfaces.IGuard) {
	var input = dto.(*dtos_towers.DeleteDto)
	var packet = p.(types.WebPacket)
	var query = ``
	query = `
		delete from tower where id = $1 and creator_id = $2;
	`
	_, err := (*app).GetDatabase().GetDb().Exec(context.Background(), query, input.TowerId, guard.GetUserId())
	if err != nil {
		fmt.Println(err)
		packet.AnswerWithJson(fasthttp.StatusInternalServerError, map[string]string{}, utils.BuildErrorJson(err.Error()))
		return
	}
	packet.AnswerWithJson(fasthttp.StatusOK, map[string]string{}, outputs_towers.DeleteOutput{})
}

func getTower(app *interfaces.IApp, p interfaces.IPacket, dto interfaces.IDto, guard interfaces.IGuard) {
	var input = dto.(*dtos_towers.GetDto)
	var packet = p.(types.WebPacket)
	var query = `
		select id, name, avatar_id from tower where id = $1 and is_public = TRUE;
	`
	var tower models.Tower
	towerId, err := strconv.ParseInt(input.TowerId, 10, 64)
	if err != nil {
		fmt.Println(err)
		packet.AnswerWithJson(fasthttp.StatusBadRequest, map[string]string{}, utils.BuildErrorJson(err.Error()))
		return
	}
	if err := (*app).GetDatabase().GetDb().QueryRow(
		context.Background(), query, towerId,
	).Scan(&tower.Id, &tower.Name, &tower.AvatarId); err != nil {
		fmt.Println(err)
		packet.AnswerWithJson(fasthttp.StatusInternalServerError, map[string]string{}, utils.BuildErrorJson(err.Error()))
		return
	}
	packet.AnswerWithJson(fasthttp.StatusOK, map[string]string{}, outputs_towers.GetOutput{Tower: tower})
}

func joinTower(app *interfaces.IApp, p interfaces.IPacket, dto interfaces.IDto, guard interfaces.IGuard) {
	var input = dto.(*dtos_towers.JoinDto)
	var packet = p.(types.WebPacket)
	var query = `
		select * from towers_join($1, $2)
	`
	var member models.Member
	if err := (*app).GetDatabase().GetDb().QueryRow(
		context.Background(), query, guard.GetUserId(), input.TowerId,
	).Scan(&member.Id, &member.HumanId, &member.TowerId); err != nil {
		fmt.Println(err)
		packet.AnswerWithJson(fasthttp.StatusInternalServerError, map[string]string{}, utils.BuildErrorJson(err.Error()))
		return
	}
	packet.AnswerWithJson(fasthttp.StatusOK, map[string]string{}, outputs_towers.JoinOutput{Member: member})
}

func CreateTowerService(app *interfaces.IApp) interfaces.IService {

	// Tables
	utils.ExecuteSqlFile("src/database/tables/tower.sql")
	utils.ExecuteSqlFile("src/database/tables/member.sql")

	// Functions
	utils.ExecuteSqlFile("src/database/functions/towers/join.sql")

	return types.CreateService("towers").
		AddMethod(types.CreateMethod("create", createTower, types.CreateCheck(true, false, false), &dtos_towers.CreateDto{})).
		AddMethod(types.CreateMethod("update", updateTower, types.CreateCheck(true, false, false), &dtos_towers.UpdateDto{})).
		AddMethod(types.CreateMethod("delete", deleteTower, types.CreateCheck(true, false, false), &dtos_towers.DeleteDto{})).
		AddMethod(types.CreateMethod("get", getTower, types.CreateCheck(false, false, false), &dtos_towers.GetDto{})).
		AddMethod(types.CreateMethod("join", joinTower, types.CreateCheck(true, false, false), &dtos_towers.JoinDto{}))
}
