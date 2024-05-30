package services_space

import (
	"errors"
	"fmt"
	inputs_spaces "sigma/storage/core/inputs/spaces"
	"sigma/storage/core/models"
	outputs_spaces "sigma/storage/core/outputs/spaces"
	"sigma/storage/core/runtime"
	updates_spaces "sigma/storage/core/updates/spaces"
	"sigma/storage/core/utils"

	"github.com/gofiber/fiber/v2"
	"google.golang.org/grpc"
	"gorm.io/gorm"
)

const memberTemplate = "member::%s::%s"

func addMember(app *runtime.App, tx *gorm.DB, input inputs_spaces.AddMemberInput, info models.Info) (any, error) {
	err := tx.First(&models.User{Id: input.UserId}).Error
	if err != nil {
		return nil, err
	}
	member := models.Member{Id: utils.SecureUniqueId(app.AppId), UserId: input.UserId, SpaceId: info.Member.SpaceId, TopicIds: "*", Metadata: ""}
	tx.Create(&member)
	app.Managers.MemoryManager().Put(fmt.Sprintf(memberTemplate, member.SpaceId, member.UserId), "true")
	go app.Managers.PushManager().PushToGroup("spaces/addMember", info.Member.SpaceId, updates_spaces.AddMember{SpaceId: info.Member.SpaceId, Member: info.Member},
		[]models.Client{
			{UserId: info.User.Id},
		})
	return outputs_spaces.AddMemberOutput{Member: member}, nil
}

func removeMember(app *runtime.App, tx *gorm.DB, input inputs_spaces.RemoveMemberInput, info models.Info) (any, error) {
	admin := models.Admin{}
	err := tx.Where("space_id = ?", info.Member.SpaceId).Where("user_id = ?", info.User.Id).First(&admin).Error
	if err != nil {
		return nil, err
	}
	member := models.Member{Id: input.MemberId}
	err2 := tx.First(&member).Error
	if err2 != nil {
		return nil, err2
	}
	tx.Delete(&member)
	app.Managers.MemoryManager().Del(fmt.Sprintf(memberTemplate, member.SpaceId, member.UserId))
	go app.Managers.PushManager().PushToGroup("spaces/removeMember", info.Member.SpaceId, updates_spaces.AddMember{SpaceId: info.Member.SpaceId, Member: info.Member},
		[]models.Client{
			{UserId: info.User.Id},
		})
	return outputs_spaces.AddMemberOutput{Member: member}, nil
}

func create(app *runtime.App, tx *gorm.DB, input inputs_spaces.CreateInput, info models.Info) (any, error) {
	space := models.Space{Id: utils.SecureUniqueId(app.AppId), Tag: input.Tag + "@" + app.AppId, Title: input.Title, Avatar: input.Avatar, IsPublic: input.IsPublic}
	tx.Create(&space)
	member := models.Member{Id: utils.SecureUniqueId(app.AppId), UserId: info.User.Id, SpaceId: space.Id, TopicIds: "*", Metadata: ""}
	tx.Create(&member)
	admin := models.Admin{Id: utils.SecureUniqueId(app.AppId), UserId: info.User.Id, SpaceId: space.Id, Role: "creator"}
	tx.Create(&admin)
	app.Managers.PushManager().JoinGroup(member.SpaceId, member.UserId)
	app.Managers.MemoryManager().Put(fmt.Sprintf(memberTemplate, member.SpaceId, member.UserId), "true")
	return outputs_spaces.CreateOutput{Space: space, Member: member}, nil
}

func update(app *runtime.App, tx *gorm.DB, input inputs_spaces.UpdateInput, info models.Info) (any, error) {
	admin := models.Admin{}
	err := tx.Where("user_id=?", info.User.Id).Where("space_id=?", input.SpaceId).First(&admin).Error
	if err != nil {
		return nil, err
	}
	space := models.Space{Id: input.SpaceId}
	tx.First(&space)
	space.Title = input.Title
	space.Avatar = input.Avatar
	space.Tag = input.Tag
	space.IsPublic = input.IsPublic
	tx.Save(&space)
	go app.Managers.PushManager().PushToGroup("spaces/update", space.Id, updates_spaces.Update{Space: space},
		[]models.Client{
			{UserId: info.User.Id},
		})
	return outputs_spaces.UpdateOutput{Space: space}, nil
}

func delete(app *runtime.App, tx *gorm.DB, input inputs_spaces.DeleteInput, info models.Info) (any, error) {
	admin := models.Admin{}
	err := tx.Where("user_id=?", info.User.Id).Where("space_id=?", input.SpaceId).First(&admin).Error
	if err != nil {
		return nil, err
	}
	if admin.Role != "creator" {
		return nil, errors.New("you are not the space creator")
	}
	space := models.Space{Id: input.SpaceId}
	err2 := tx.First(&space).Error
	if err2 != nil {
		return nil, err2
	}
	tx.Delete(&space)
	go app.Managers.PushManager().PushToGroup("spaces/delete", space.Id, updates_spaces.Update{Space: space},
		[]models.Client{
			{UserId: info.User.Id},
		})
	return outputs_spaces.DeleteOutput{Space: space}, nil
}

func get(app *runtime.App, tx *gorm.DB, input inputs_spaces.GetInput, info models.Info) (any, error) {
	space := models.Space{Id: input.SpaceId}
	tx.First(&space)
	if space.IsPublic {
		return outputs_spaces.GetOutput{Space: space}, nil
	}
	member := models.Member{}
	err := tx.Where("space_id = ?", input.SpaceId).Where("user_id = ?", info.User.Id).First(&member).Error
	if err != nil {
		return nil, errors.New("space not found")
	}
	return outputs_spaces.GetOutput{Space: space}, nil
}

func join(app *runtime.App, tx *gorm.DB, input inputs_spaces.JoinInput, info models.Info) (any, error) {
	space := models.Space{Id: input.SpaceId}
	err := tx.First(&space).Error
	if err != nil {
		return nil, err
	}
	if !space.IsPublic {
		return nil, errors.New("access to private space denied")
	}
	member := models.Member{Id: utils.SecureUniqueId(app.AppId), UserId: info.User.Id, SpaceId: input.SpaceId, TopicIds: "*", Metadata: ""}
	err2 := tx.Create(&member).Error
	if err2 != nil {
		return nil, err2
	}
	app.Managers.PushManager().JoinGroup(member.SpaceId, member.UserId)
	app.Managers.MemoryManager().Put(fmt.Sprintf(memberTemplate, member.SpaceId, member.UserId), "true")
	go app.Managers.PushManager().PushToGroup("spaces/join", member.SpaceId, updates_spaces.Join{Member: member},
		[]models.Client{
			{UserId: member.UserId},
		})
	return outputs_spaces.JoinOutput{Member: member}, nil
}

func CreateSpaceService(app *runtime.App, openToNet bool) {

	app.Managers.DatabaseManager().Db.AutoMigrate(&models.Space{})
	app.Managers.DatabaseManager().Db.AutoMigrate(&models.Member{})
	app.Managers.DatabaseManager().Db.AutoMigrate(&models.Admin{})

	app.Services.AddAction(runtime.CreateAction(
		app,
		"/spaces/create",
		runtime.CreateCk(true, false, false),
		runtime.CreateAc(openToNet, true, false, false, fiber.MethodPost),
		true,
		create,
	))
	app.Services.AddAction(runtime.CreateAction(
		app,
		"/spaces/update",
		runtime.CreateCk(true, false, false),
		runtime.CreateAc(openToNet, true, false, false, fiber.MethodPut),
		true,
		update,
	))
	app.Services.AddAction(runtime.CreateAction(
		app,
		"/spaces/delete",
		runtime.CreateCk(true, false, false),
		runtime.CreateAc(openToNet, true, false, false, fiber.MethodDelete),
		true,
		delete,
	))
	app.Services.AddAction(runtime.CreateAction(
		app,
		"/spaces/get",
		runtime.CreateCk(true, false, false),
		runtime.CreateAc(openToNet, true, false, false, fiber.MethodGet),
		true,
		get,
	))
	app.Services.AddAction(runtime.CreateAction(
		app,
		"/spaces/join",
		runtime.CreateCk(true, false, false),
		runtime.CreateAc(openToNet, true, false, false, fiber.MethodPost),
		true,
		join,
	))
	app.Services.AddAction(runtime.CreateAction(
		app,
		"/spaces/addMember",
		runtime.CreateCk(true, true, false),
		runtime.CreateAc(openToNet, true, false, false, fiber.MethodPost),
		true,
		addMember,
	))
	app.Services.AddAction(runtime.CreateAction(
		app,
		"/spaces/removeMember",
		runtime.CreateCk(true, true, false),
		runtime.CreateAc(openToNet, true, false, false, fiber.MethodPost),
		true,
		removeMember,
	))
}

func LoadSpaceGrpcService(grpcServer *grpc.Server) {
	// type server struct {
	// 	pb.UnimplementedSpaceServiceServer
	// }
	// pb.RegisterSpaceServiceServer(grpcServer, &server{})
}
