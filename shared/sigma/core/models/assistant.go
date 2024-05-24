package models

import (
	"github.com/gofiber/fiber/v2"
)

type Assistant struct {
	UserId     int64
	UserType   string
	WorkerId   int64
	TowerId    int64
	RoomId     int64
	UserOrigin string
	Ctx        *fiber.Ctx
}

func CreateAssistant(userId int64, userOrigin string, userType string, towerId int64, roomId int64, workerId int64, ctx *fiber.Ctx) Assistant {
	return Assistant{UserId: userId, UserOrigin: userOrigin, UserType: userType, TowerId: towerId, RoomId: roomId, WorkerId: workerId, Ctx: ctx}
}
