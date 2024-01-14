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
			verifyCode,
			clientCode,
			state
		) values ($1, $2, $3, $4)
		ON CONFLICT(email) DO UPDATE SET verifyCode = EXCLUDED.verifyCode, state = $4
		RETURNING id, email, verifyCode, clientCode, state;
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
		update pending set state = $1 where clientCode = $2 and verifyCode = $3 and state = 'created'
		RETURNING id, email, verifyCode, clientCode, state;
	`
	var pending models.Pending
	if err := (*app).GetDatabase().GetDb().QueryRow(
		context.Background(), query, "verified", input.ClientCode, input.VerifyCode,
	).Scan(&pending.Id, &pending.Email, &pending.VerifyCode, &pending.ClientCode, &pending.State); err != nil {
		fmt.Println(err)
		packet.AnswerWithJson(fasthttp.StatusInternalServerError, map[string]string{}, utils.BuildErrorJson(err.Error()))
		return
	}
	packet.AnswerWithJson(fasthttp.StatusOK, map[string]string{}, outputs_humans.VerifyOutput{Pending: pending})
}

func complete(app *interfaces.IApp, p interfaces.IPacket, dto interfaces.IDto) {
	var input = dto.(*dtos_humans.CompleteDto)
	var packet = p.(types.WebPacket)
	var human models.Human
	var query = `
		select * from humans_complete($1, $2, $3, $4)
	`
	if err := (*app).GetDatabase().GetDb().QueryRow(context.Background(), query, input.ClientCode, input.VerifyCode, input.FirstName, input.LastName).
		Scan(&human.Id, &human.Email, &human.FirstName, &human.LastName); err != nil {
		fmt.Println(err)
		packet.AnswerWithJson(fasthttp.StatusInternalServerError, map[string]string{}, utils.BuildErrorJson(err.Error()))
		return
	}
	packet.AnswerWithJson(fasthttp.StatusOK, map[string]string{}, outputs_humans.CompleteOutput{Human: human})
}

func CreateHumanService(app *interfaces.IApp) interfaces.IService {
	var db = (*app).GetDatabase().GetDb()
	result, err := db.Exec(context.Background(), `
		create table pending
		(
   	 		id            bigserial    not null constraint pending_pk primary key,
    		email         varchar(100) not null unique,
    		verifyCode    varchar(100) not null,
			clientCode    varchar(100) not null,
			state         varchar(100) not null
		);
	`)
	if err != nil {
		fmt.Println(err)
	} else {
		fmt.Println(result)
	}
	result2, err2 := db.Exec(context.Background(), `
		create table human
		(
			id           bigserial    not null constraint person_pk primary key,
			email        varchar(100) not null unique,
			firstName    varchar(100) not null,
			lastName     varchar(100) not null
		);
	`)
	if err2 != nil {
		fmt.Println(err2)
	} else {
		fmt.Println(result2)
	}
	result3, err3 := db.Exec(context.Background(), `
		create function humans_complete(cc varchar(100), vc varchar(100), fname varchar(100), lname varchar(100))
		returns TABLE (
			i bigint,
		    em text,
			fn text,
			ln text
		) as $$
		declare
			res1   text;
			res2   text;
			hId    bigint;
			hEmail text;
			hFName text;
			hLName text;
		BEGIN
			update pending set state = 'completed' where clientCode = cc and verifyCode = vc and state = 'verified'
			returning state, email into res1, res2;
			if res1 = 'completed' then
				insert into human
				(
					email,
					firstName,
					lastName
				) values (res2, fname, lname)
				ON CONFLICT(email) DO UPDATE SET firstName = fname, lastName = lname
				returning id, email, firstName, lastName into hId, hEmail, hFName, HLName;
				RETURN QUERY SELECT hId as i, hEmail as em, hFName as fn, HLName as ln;
			else
				raise notice 'pending not found';
  			end if;
		END $$
		LANGUAGE plpgsql;
	`)
	if err3 != nil {
		fmt.Println(err3)
	} else {
		fmt.Println(result3)
	}

	return types.CreateService("humans").
		AddMethod(types.CreateMethod("signup", signup, types.CreateCheck(false, false, false), &dtos_humans.SignupDto{})).
		AddMethod(types.CreateMethod("verify", verify, types.CreateCheck(false, false, false), &dtos_humans.VerifyDto{})).
		AddMethod(types.CreateMethod("complete", complete, types.CreateCheck(false, false, false), &dtos_humans.CompleteDto{}))
}
