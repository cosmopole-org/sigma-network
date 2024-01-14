package services

import (
	"context"
	"fmt"

	dtos_humans "sigma/core/src/dtos/humans"
	"sigma/core/src/interfaces"
	"sigma/core/src/models"
	outputs_humans "sigma/core/src/outputs"
	"sigma/core/src/types"
	"sigma/core/src/utils"

	"github.com/valyala/fasthttp"
)

func signup(app *interfaces.IApp, p interfaces.IPacket, dto interfaces.IDto) {
	var input = dto.(*dtos_humans.SignupDto)
	var packet = p.(types.WebPacket)
	var cc, err1 = utils.SecureUniqueString(32)
	if err1 != nil {
		fmt.Println(err1)
		return
	}
	var vc, err2 = utils.SecureUniqueString(32)
	if err2 != nil {
		fmt.Println(err2)
		return
	}
	var query = `
		insert into pending
		(
			email,
			verify_code,
			client_code,
			state
		) values ($1, $2, $3, $4)
		on conflict(email) do update set verify_code = excluded.verify_code, state = $4
		returning id, email, verify_code, client_code, state;
	`
	var pending models.Pending
	if err := (*app).GetDatabase().GetDb().QueryRow(
		context.Background(), query, input.Email, vc, cc, "created",
	).Scan(&pending.Id, &pending.Email, &pending.VerifyCode, &pending.ClientCode, &pending.State); err != nil {
		fmt.Println(err)
		packet.AnswerWithJson(fasthttp.StatusInternalServerError, map[string]string{}, utils.BuildErrorJson(err.Error()))
		return
	}
	packet.AnswerWithJson(fasthttp.StatusOK, map[string]string{}, outputs_humans.SignupOutput{Pending: pending})
}

func verify(app *interfaces.IApp, p interfaces.IPacket, dto interfaces.IDto) {
	var input = dto.(*dtos_humans.VerifyDto)
	var packet = p.(types.WebPacket)
	var query = `
		select humans_verify($1, $2)
	`
	type Record struct {
		p_id         int64
		p_cc         string
		P_vc         string
		P_state      string
		P_email      string
		h_id         int64
		h_email      string
		h_first_name string
		h_last_name  string
	}
	var record []interface{}
	if err := (*app).GetDatabase().GetDb().QueryRow(
		context.Background(), query, input.ClientCode, input.VerifyCode,
	).Scan(
		&record,
	); err != nil {
		fmt.Println(err)
		packet.AnswerWithJson(fasthttp.StatusInternalServerError, map[string]string{}, utils.BuildErrorJson(err.Error()))
		return
	}
	var pending = models.Pending{
		Id:         record[0].(int64),
		ClientCode: record[1].(string),
		VerifyCode: record[2].(string),
		State:      record[3].(string),
		Email:      record[4].(string),
	}
	if record[5] == nil {
		packet.AnswerWithJson(fasthttp.StatusOK, map[string]string{}, outputs_humans.VerifyOutput{Pending: pending, Human: nil, Session: nil})
	} else {
		var human = models.Human{
			Id:        record[5].(int64),
			Email:     record[6].(string),
			FirstName: record[7].(string),
			LastName:  record[8].(string),
		}
		var session = models.Session{
			Id:     record[9].(int64),
			UserId: human.Id,
			Token:  record[10].(string),
		}
		packet.AnswerWithJson(fasthttp.StatusOK, map[string]string{}, outputs_humans.VerifyOutput{Pending: pending, Human: human, Session: session})
	}
}

func complete(app *interfaces.IApp, p interfaces.IPacket, dto interfaces.IDto) {
	var input = dto.(*dtos_humans.CompleteDto)
	var packet = p.(types.WebPacket)
	var human models.Human
	var session models.Session
	var token, tokenErr = utils.SecureUniqueString(32)
	if tokenErr != nil {
		fmt.Println(tokenErr)
		return
	}
	var query = `
		select * from humans_complete($1, $2, $3, $4, $5)
	`
	if err := (*app).GetDatabase().GetDb().QueryRow(context.Background(), query, input.ClientCode, input.VerifyCode, input.FirstName, input.LastName, token).
		Scan(&human.Id, &human.Email, &human.FirstName, &human.LastName, &session.UserId, &session.Token); err != nil {
		fmt.Println(err)
		packet.AnswerWithJson(fasthttp.StatusInternalServerError, map[string]string{}, utils.BuildErrorJson(err.Error()))
		return
	}
	packet.AnswerWithJson(fasthttp.StatusOK, map[string]string{}, outputs_humans.CompleteOutput{Human: human, Session: session})
}

func CreateHumanService(app *interfaces.IApp) interfaces.IService {
	
	// Tables
	utils.ExecuteSqlFile("src/database/tables/session.sql")
	utils.ExecuteSqlFile("src/database/tables/pending.sql")
	utils.ExecuteSqlFile("src/database/tables/human.sql")

	// Functipns
	utils.ExecuteSqlFile("src/database/functions/humans/complete.sql")
	utils.ExecuteSqlFile("src/database/functions/humans/verify.sql")

	return types.CreateService("humans").
		AddMethod(types.CreateMethod("signup", signup, types.CreateCheck(false, false, false), &dtos_humans.SignupDto{})).
		AddMethod(types.CreateMethod("verify", verify, types.CreateCheck(false, false, false), &dtos_humans.VerifyDto{})).
		AddMethod(types.CreateMethod("complete", complete, types.CreateCheck(false, false, false), &dtos_humans.CompleteDto{}))
}
