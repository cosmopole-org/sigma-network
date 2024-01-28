package cosmopole_services

import (
	"context"
	"fmt"
	cosmopole_dtos_messenger "sigma/core/cosmopole/dtos/messenger"
	cosmopole_models "sigma/core/cosmopole/models"
	cosmopole_outputs_messenger "sigma/core/cosmopole/outputs/messenger"
	cosmopole_updates_messenger "sigma/core/cosmopole/updates/messenger"
	"sigma/core/src/interfaces"
	outputs_rooms "sigma/core/src/outputs/rooms"
	"sigma/core/src/types"
	"sigma/core/src/utils"
	"time"
)

func createMessage(app *interfaces.IApp, dto interfaces.IDto, guard interfaces.IGuard) (any, error) {
	var input = dto.(*cosmopole_dtos_messenger.CreateDto)
	var query = `
		insert into message
		(
			data,
			time,
			author_id,
			space_id
		) values ($1, $2, $3, $4)
		returning id;
	`
	var message cosmopole_models.Message
	var now = time.Now().UnixMilli()
	if err := (*app).GetDatabase().GetDb().QueryRow(
		context.Background(), query, input.Data, now, guard.GetUserId(), guard.GetRoomId(),
	).Scan(&message.Id); err != nil {
		fmt.Println(err)
		return outputs_rooms.CreateOutput{}, err
	}
	if message.Id > 0 {
		message.Time = now
		message.AuthorId = guard.GetUserId()
		message.SpaceId = guard.GetRoomId()
		message.Data = input.Data
	}
	go (*app).GetNetwork().PushToGroup(guard.GetRoomId(), cosmopole_updates_messenger.Create{Message: message}, []int64{guard.GetUserId()})
	return cosmopole_outputs_messenger.CreateOutput{Message: message}, nil
}

func updateMessage(app *interfaces.IApp, dto interfaces.IDto, guard interfaces.IGuard) (any, error) {
	var input = dto.(*cosmopole_dtos_messenger.UpdateDto)
	var query = `
		update message set data = $1 where author_id = $2 and id = $3 limit 1
		returning id, author_id, data, space_id, time;
	`
	var message cosmopole_models.Message
	if err := (*app).GetDatabase().GetDb().QueryRow(
		context.Background(), query, input.Data, guard.GetUserId(), input.MessageId,
	).Scan(&message.Id, &message.AuthorId, &message.Data, &message.SpaceId, &message.Time); err != nil {
		fmt.Println(err)
		return cosmopole_outputs_messenger.UpdateOutput{Message: message}, err
	}
	go (*app).GetNetwork().PushToGroup(message.SpaceId, cosmopole_updates_messenger.Update{Message: message}, []int64{guard.GetUserId()})
	return cosmopole_outputs_messenger.UpdateOutput{Message: message}, nil
}

func deleteMessage(app *interfaces.IApp, dto interfaces.IDto, guard interfaces.IGuard) (any, error) {
	var input = dto.(*cosmopole_dtos_messenger.DeleteDto)
	var query = `
		delete from message where author_id = $1 and id = $2 limit 1
		returning id, author_id, data, space_id, time;
	`
	var message cosmopole_models.Message
	if err := (*app).GetDatabase().GetDb().QueryRow(
		context.Background(), query, guard.GetUserId(), input.MessageId,
	).Scan(&message.Id, &message.AuthorId, &message.Data, &message.SpaceId, &message.Time); err != nil {
		fmt.Println(err)
		return cosmopole_outputs_messenger.DeleteOutput{Message: message}, err
	}
	go (*app).GetNetwork().PushToGroup(message.SpaceId, cosmopole_updates_messenger.Delete{Message: message}, []int64{guard.GetUserId()})
	return cosmopole_outputs_messenger.DeleteOutput{Message: message}, nil
}

func readMessages(app *interfaces.IApp, dto interfaces.IDto, guard interfaces.IGuard) (any, error) {
	var input = dto.(*cosmopole_dtos_messenger.ReadDto)
	var query = `
		with t as (
			select id, data, author_id, space_id, time from message where space_id = $1 order by time desc offset $2 limit $3
		)
		select id, data, author_id, space_id, time from t order by time asc;
	`
	rows, err := (*app).GetDatabase().GetDb().Query(context.Background(), query, guard.GetRoomId(), input.Offset, input.Count)
	if err != nil {
		fmt.Println(err)
	}
	var rowSlice []cosmopole_models.Message
	for rows.Next() {
		var m cosmopole_models.Message
		err := rows.Scan(&m.Id, &m.Data, &m.AuthorId, &m.SpaceId, &m.Time)
		if err != nil {
			fmt.Println(err)
		}
		rowSlice = append(rowSlice, m)
	}
	if err := rows.Err(); err != nil {
		fmt.Println(err)
	}
	return cosmopole_outputs_messenger.ReadOutput{Messages: rowSlice}, nil
}

func CreateMessengerService(app *interfaces.IApp) interfaces.IService {

	// Tables
	utils.ExecuteSqlFile("cosmopole/database/tables/message.sql")

	return types.CreateService("messenger").
		AddMethod(types.CreateMethod("create", createMessage, types.CreateCheck(true, true, true), &cosmopole_dtos_messenger.CreateDto{}, true)).
		AddMethod(types.CreateMethod("update", updateMessage, types.CreateCheck(true, true, true), &cosmopole_dtos_messenger.UpdateDto{}, true)).
		AddMethod(types.CreateMethod("delete", deleteMessage, types.CreateCheck(true, true, true), &cosmopole_dtos_messenger.DeleteDto{}, true)).
		AddMethod(types.CreateMethod("read", readMessages, types.CreateCheck(true, true, true), &cosmopole_dtos_messenger.ReadDto{}, true))
}
