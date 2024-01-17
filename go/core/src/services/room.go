package services

import (
	"context"
	"fmt"
	dtos_rooms "sigma/core/src/dtos/rooms"
	"sigma/core/src/interfaces"
	"sigma/core/src/models"
	outputs_rooms "sigma/core/src/outputs/rooms"
	"sigma/core/src/types"
	"sigma/core/src/utils"
	"strconv"

	"github.com/valyala/fasthttp"
)

func createRoom(app *interfaces.IApp, p interfaces.IPacket, dto interfaces.IDto, guard interfaces.IGuard) {
	var input = dto.(*dtos_rooms.CreateDto)
	var packet = p.(types.WebPacket)
	var query = `
		insert into room
		(
			name,
			avatar_id,
			tower_id
		) values ($1, $2, $3)
		returning id, name, avatar_id, tower_id;
	`
	var room models.Room
	if err := (*app).GetDatabase().GetDb().QueryRow(
		context.Background(), query, input.Name, input.AvatarId, guard.GetTowerId(),
	).Scan(&room.Id, &room.Name, &room.AvatarId, &room.TowerId); err != nil {
		fmt.Println(err)
		packet.AnswerWithJson(fasthttp.StatusInternalServerError, map[string]string{}, utils.BuildErrorJson(err.Error()))
		return
	}
	packet.AnswerWithJson(fasthttp.StatusOK, map[string]string{}, outputs_rooms.CreateOutput{Room: room})
}

func updateRoom(app *interfaces.IApp, p interfaces.IPacket, dto interfaces.IDto, guard interfaces.IGuard) {
	var input = dto.(*dtos_rooms.UpdateDto)
	var packet = p.(types.WebPacket)
	var query = `
		update room set name = $1, avatar_id = $2 where id = $3 and tower_id = $4
		returning id, name, avatar_id, tower_id;
	`
	var room models.Room
	if err := (*app).GetDatabase().GetDb().QueryRow(
		context.Background(), query, input.Name, input.AvatarId, input.RoomId, guard.GetTowerId(),
	).Scan(&room.Id, &room.Name, &room.AvatarId, &room.TowerId); err != nil {
		fmt.Println(err)
		packet.AnswerWithJson(fasthttp.StatusInternalServerError, map[string]string{}, utils.BuildErrorJson(err.Error()))
		return
	}
	packet.AnswerWithJson(fasthttp.StatusOK, map[string]string{}, outputs_rooms.UpdateOutput{Room: room})
}

func deleteRoom(app *interfaces.IApp, p interfaces.IPacket, dto interfaces.IDto, guard interfaces.IGuard) {
	var input = dto.(*dtos_rooms.DeleteDto)
	var packet = p.(types.WebPacket)
	var query = ``
	query = `
		delete from room where id = $1 and tower_id = $2;
	`
	_, err := (*app).GetDatabase().GetDb().Exec(context.Background(), query, input.RoomId, guard.GetTowerId())
	if err != nil {
		fmt.Println(err)
		packet.AnswerWithJson(fasthttp.StatusInternalServerError, map[string]string{}, utils.BuildErrorJson(err.Error()))
		return
	}
	packet.AnswerWithJson(fasthttp.StatusOK, map[string]string{}, outputs_rooms.DeleteOutput{})
}

func getRoom(app *interfaces.IApp, p interfaces.IPacket, dto interfaces.IDto, guard interfaces.IGuard) {
	var input = dto.(*dtos_rooms.GetDto)
	var packet = p.(types.WebPacket)
	var query = `
		select id, name, avatar_id from tower where id = $1 and tower_id = $2;
	`
	var room models.Room
	roomId, err := strconv.ParseInt(input.RoomId, 10, 64)
	if err != nil {
		fmt.Println(err)
		packet.AnswerWithJson(fasthttp.StatusBadRequest, map[string]string{}, utils.BuildErrorJson(err.Error()))
		return
	}
	if err := (*app).GetDatabase().GetDb().QueryRow(
		context.Background(), query, roomId,
	).Scan(&room.Id, &room.Name, &room.AvatarId); err != nil {
		fmt.Println(err)
		packet.AnswerWithJson(fasthttp.StatusInternalServerError, map[string]string{}, utils.BuildErrorJson(err.Error()))
		return
	}
	packet.AnswerWithJson(fasthttp.StatusOK, map[string]string{}, outputs_rooms.GetOutput{Room: room})
}

func CreateRoomService(app *interfaces.IApp) interfaces.IService {

	utils.ExecuteSqlFile("src/database/tables/room.sql")

	return types.CreateService("rooms").
		AddMethod(types.CreateMethod("create", createRoom, types.CreateCheck(true, true, false), &dtos_rooms.CreateDto{})).
		AddMethod(types.CreateMethod("update", updateRoom, types.CreateCheck(true, true, false), &dtos_rooms.UpdateDto{})).
		AddMethod(types.CreateMethod("delete", deleteRoom, types.CreateCheck(true, true, false), &dtos_rooms.DeleteDto{})).
		AddMethod(types.CreateMethod("get", getRoom, types.CreateCheck(true, false, false), &dtos_rooms.GetDto{}))
}
