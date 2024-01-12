package services

import (
	"context"
	"fmt"
	"sigma/core/src/interfaces"
	"sigma/core/src/types"

	"github.com/valyala/fasthttp"
)

func signup(app *interfaces.IApp, input interfaces.IPacket) {
	var packet = input.(types.WebPacket)
	packet.AnswerWithJson(fasthttp.StatusOK, map[string]string{}, []byte(`{ "message": "operation done successfully." }`))
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
		AddMethod(types.CreateMethod("signup", signup, *types.CreateCheck(false, false, false)))
}
