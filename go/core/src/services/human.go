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

func signup(app *interfaces.IApp, input interfaces.IPacket) {
	var packet = input.(types.WebPacket)
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
	var query =  `
		insert into pending
		(
			email,
			verifyCode,
			clientCode
		) values ($1, $2, $3)
		RETURNING id, email, verifyCode, clientCode;
	`
	var pending models.Pending
	if err := (*app).GetDatabase().GetDb().QueryRow(
		context.Background(), query, "hawk", vc, cc,
	).Scan(&pending.Id, &pending.Email, &pending.VerifyCode, &pending.ClientCode); err != nil {
		fmt.Println(err)
	}
	packet.AnswerWithJson(fasthttp.StatusOK, map[string]string{}, outputs_humans.SignupOutput{Pending: pending})
}

func CreateHumanService(app *interfaces.IApp) interfaces.IService {
	var db = (*app).GetDatabase().GetDb()
	result, err := db.Exec(context.Background(), `
		create table pending
		(
   	 		id            bigserial    not null constraint pending_pk primary key,
    		email         varchar(100) not null,
    		verifyCode    varchar(100) not null,
			clientCode    varchar(100) not null
		);
	`)
	if err != nil {
		fmt.Println(err)
	} else {
		fmt.Println(result)
	}
	result2, err2 := db.Exec(context.Background(), `
		create table person
		(
   	 		id            bigserial    not null constraint person_pk primary key,
    		first_name    varchar(100) not null,
    		last_name     varchar(100) not null
		);
	`)
	if err2 != nil {
		fmt.Println(err2)
	} else {
		fmt.Println(result2)
	}

	return types.CreateService("humans").
		AddMethod(types.CreateMethod("signup", signup, *types.CreateCheck(false, false, false), &dtos_humans.SignupDto{}))
}
