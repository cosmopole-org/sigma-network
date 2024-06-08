package actions_space

import (
	"errors"
	"fmt"
	"sigma/main/core/models"
	outputs_spaces "sigma/main/core/outputs/spaces"
	"sigma/main/core/runtime"
	updates_spaces "sigma/main/core/updates/spaces"
	"sigma/main/core/utils"
)

const memberTemplate = "member::%s::%s"

type SpaceActions struct {
	App *runtime.App
}

// AddMember /spaces/addMember check [ true true false ] access [ true false false false POST ]
func (a *SpaceActions) AddMember(s abstract.IState, input inputs_*.*) (any, error) {
	err := context.Trx.First(&models.User{Id: input.UserId}).Error()
	if err != nil {
		return nil, err
	}
	member := models.Member{Id: utils.SecureUniqueId(context.AppId), UserId: input.UserId, SpaceId: info.Member.SpaceId, TopicIds: "*", Metadata: ""}
	context.Trx.Create(&member)
	context.Adapters().Cache().Put(fmt.Sprintf(memberTemplate, member.SpaceId, member.UserId), "true")
	go context.Signaler().SignalGroup("spaces/addMember", info.Member.SpaceId, updates_spaces.AddMember{SpaceId: info.Member.SpaceId, Member: info.Member}, true, []string{info.User.Id})
	return outputs_spaces.AddMemberOutput{Member: member}, nil
}

// RemoveMember /spaces/removeMember check [ true true false ] access [ true false false false POST ]
func (a *SpaceActions) RemoveMember(s abstract.IState, input inputs_*.*) (any, error) {
	admin := models.Admin{}
	err := context.Trx.Where("space_id = ?", info.Member.SpaceId).Where("user_id = ?", info.User.Id).First(&admin).Error()
	if err != nil {
		return nil, err
	}
	member := models.Member{Id: input.MemberId}
	err2 := context.Trx.First(&member).Error()
	if err2 != nil {
		return nil, err2
	}
	context.Trx.Delete(&member)
	context.Adapters().Cache().Del(fmt.Sprintf(memberTemplate, member.SpaceId, member.UserId))
	go context.Signaler().SignalGroup("spaces/removeMember", info.Member.SpaceId, updates_spaces.AddMember{SpaceId: info.Member.SpaceId, Member: info.Member}, true, []string{info.User.Id})
	return outputs_spaces.AddMemberOutput{Member: member}, nil
}

// Create /spaces/create check [ true false false ] access [ true false false false POST ]
func (a *SpaceActions) Create(s abstract.IState, input inputs_*.*) (any, error) {
	space := models.Space{Id: utils.SecureUniqueId(context.AppId), Tag: input.Tag + "@" + context.AppId, Title: input.Title, Avatar: input.Avatar, IsPublic: input.IsPublic}
	context.Trx.Create(&space)
	member := models.Member{Id: utils.SecureUniqueId(context.AppId), UserId: info.User.Id, SpaceId: space.Id, TopicIds: "*", Metadata: ""}
	context.Trx.Create(&member)
	admin := models.Admin{Id: utils.SecureUniqueId(context.AppId), UserId: info.User.Id, SpaceId: space.Id, Role: "creator"}
	context.Trx.Create(&admin)
	context.Signaler().JoinGroup(member.SpaceId, member.UserId)
	context.Adapters().Cache().Put(fmt.Sprintf(memberTemplate, member.SpaceId, member.UserId), "true")
	return outputs_spaces.CreateOutput{Space: space, Member: member}, nil
}

// Update /spaces/update check [ true false false ] access [ true false false false PUT ]
func (a *SpaceActions) Update(s abstract.IState, input inputs_*.*) (any, error) {
	admin := models.Admin{}
	err := context.Trx.Where("user_id=?", info.User.Id).Where("space_id=?", input.SpaceId).First(&admin).Error()
	if err != nil {
		return nil, err
	}
	space := models.Space{Id: input.SpaceId}
	context.Trx.First(&space)
	space.Title = input.Title
	space.Avatar = input.Avatar
	space.Tag = input.Tag + "@" + context.AppId
	space.IsPublic = input.IsPublic
	context.Trx.Save(&space)
	go context.Signaler().SignalGroup("spaces/update", space.Id, updates_spaces.Update{Space: space}, true, []string{info.User.Id})
	return outputs_spaces.UpdateOutput{Space: space}, nil
}

// Delete /spaces/delete check [ true false false ] access [ true false false false DELETE ]
func (a *SpaceActions) Delete(s abstract.IState, input inputs_*.*) (any, error) {
	admin := models.Admin{}
	err := context.Trx.Where("user_id=?", info.User.Id).Where("space_id=?", input.SpaceId).First(&admin).Error()
	if err != nil {
		return nil, err
	}
	if admin.Role != "creator" {
		return nil, errors.New("you are not the space creator")
	}
	space := models.Space{Id: input.SpaceId}
	err2 := context.Trx.First(&space).Error()
	if err2 != nil {
		return nil, err2
	}
	context.Trx.Delete(&space)
	go context.Signaler().SignalGroup("spaces/delete", space.Id, updates_spaces.Delete{Space: space}, true, []string{info.User.Id})
	return outputs_spaces.DeleteOutput{Space: space}, nil
}

// Get /spaces/get check [ true false false ] access [ true false false false GET ]
func (a *SpaceActions) Get(s abstract.IState, input inputs_*.*) (any, error) {
	space := models.Space{Id: input.SpaceId}
	context.Trx.First(&space)
	if space.IsPublic {
		return outputs_spaces.GetOutput{Space: space}, nil
	}
	member := models.Member{}
	err := context.Trx.Where("space_id = ?", input.SpaceId).Where("user_id = ?", info.User.Id).First(&member).Error()
	if err != nil {
		return nil, errors.New("space not found")
	}
	return outputs_spaces.GetOutput{Space: space}, nil
}

// Join /spaces/join check [ true false false ] access [ true false false false POST ]
func (a *SpaceActions) Join(s abstract.IState, input inputs_*.*) (any, error) {
	space := models.Space{Id: input.SpaceId}
	err := context.Trx.First(&space).Error()
	if err != nil {
		return nil, err
	}
	if !space.IsPublic {
		return nil, errors.New("access to private space denied")
	}
	member := models.Member{Id: utils.SecureUniqueId(context.AppId), UserId: info.User.Id, SpaceId: input.SpaceId, TopicIds: "*", Metadata: ""}
	err2 := context.Trx.Create(&member).Error()
	if err2 != nil {
		return nil, err2
	}
	context.Signaler().JoinGroup(member.SpaceId, member.UserId)
	context.Adapters().Cache().Put(fmt.Sprintf(memberTemplate, member.SpaceId, member.UserId), "true")
	go context.Signaler().SignalGroup("spaces/join", member.SpaceId, updates_spaces.Join{Member: member}, true, []string{member.UserId})
	return outputs_spaces.JoinOutput{Member: member}, nil
}
