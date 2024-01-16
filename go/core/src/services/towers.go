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
			creator_id
		) values ($1, $2, $3)
		returning id, name, avatar_id, creator_id;
	`
	var tower models.Tower
	if err := (*app).GetDatabase().GetDb().QueryRow(
		context.Background(), query, input.Name, input.AvatarId, guard.GetUserId(),
	).Scan(&tower.Id, &tower.Name, &tower.AvatarId, &tower.CreatorId); err != nil {
		fmt.Println(err)
		packet.AnswerWithJson(fasthttp.StatusInternalServerError, map[string]string{}, utils.BuildErrorJson(err.Error()))
		return
	}
	packet.AnswerWithJson(fasthttp.StatusOK, map[string]string{}, outputs_towers.CreateOutput{Tower: tower})
}

func updateTower(app *interfaces.IApp, p interfaces.IPacket, dto interfaces.IDto, guard interfaces.IGuard) {
	var input = dto.(*dtos_towers.UpdateDto)
	var packet = p.(types.WebPacket)
	var params []any
	var query = ``
	if input.AvatarId > 0 {
		query = `
			update tower set name = $1, avatar_id = $2, where id = $3 and creator_id = $4
			returning id, name, avatar_id, creator_id;
		`
		params = []any{input.Name, input.AvatarId, input.TowerId, guard.GetUserId()}
	} else {
		query = `
			update tower set name = $1, where id = $2 and creator_id = $3
			returning id, name, avatar_id, creator_id;
		`
		params = []any{input.Name, input.TowerId, guard.GetUserId()}
	}
	var tower models.Tower
	if err := (*app).GetDatabase().GetDb().QueryRow(
		context.Background(), query, params...,
	).Scan(&tower.Id, &tower.Name, &tower.AvatarId, &tower.CreatorId); err != nil {
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
		select id, name, avatar_id from tower where id = $1;
	`
	var tower models.Tower
	if err := (*app).GetDatabase().GetDb().QueryRow(
		context.Background(), query, input.TowerId,
	).Scan(&tower.Id, &tower.Name, &tower.AvatarId); err != nil {
		fmt.Println(err)
		packet.AnswerWithJson(fasthttp.StatusInternalServerError, map[string]string{}, utils.BuildErrorJson(err.Error()))
		return
	}
	packet.AnswerWithJson(fasthttp.StatusOK, map[string]string{}, outputs_towers.GetOutput{Tower: tower})
}

func CreateTowerService(app *interfaces.IApp) interfaces.IService {
	return types.CreateService("towers").
		AddMethod(types.CreateMethod("create", createTower, types.CreateCheck(true, false, false), &dtos_towers.CreateDto{})).
		AddMethod(types.CreateMethod("update", updateTower, types.CreateCheck(true, false, false), &dtos_towers.CreateDto{})).
		AddMethod(types.CreateMethod("delete", deleteTower, types.CreateCheck(true, false, false), &dtos_towers.CreateDto{})).
		AddMethod(types.CreateMethod("get", getTower, types.CreateCheck(false, false, false), &dtos_towers.CreateDto{}))
}
