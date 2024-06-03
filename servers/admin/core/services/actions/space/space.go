package actions_space

import (
	"errors"
	"fmt"
	inputs_spaces "sigma/admin/core/inputs/spaces"
	"sigma/admin/core/models"
	outputs_spaces "sigma/admin/core/outputs/spaces"
	"sigma/admin/core/runtime"
	updates_spaces "sigma/admin/core/updates/spaces"
	"sigma/admin/core/utils"
)

const memberTemplate = "member::%s::%s"

type SpaceActions struct {
	App *runtime.App
}

// AddMember /spaces/addMember check [ true true false ] access [ true false false false POST ]
func (a *SpaceActions) AddMember(control *runtime.Control, input inputs_spaces.AddMemberInput, info models.Info) (any, error) {
	err := control.Trx.First(&models.User{Id: input.UserId}).Error()
	if err != nil {
		return nil, err
	}
	member := models.Member{Id: utils.SecureUniqueId(control.AppId), UserId: input.UserId, SpaceId: info.Member.SpaceId, TopicIds: "*", Metadata: ""}
	control.Trx.Create(&member)
	control.Adapters().Cache().Put(fmt.Sprintf(memberTemplate, member.SpaceId, member.UserId), "true")
	go control.Signaler().SignalGroup("spaces/addMember", info.Member.SpaceId, updates_spaces.AddMember{SpaceId: info.Member.SpaceId, Member: info.Member}, true, []string{info.User.Id})
	return outputs_spaces.AddMemberOutput{Member: member}, nil
}

// RemoveMember /spaces/removeMember check [ true true false ] access [ true false false false POST ]
func (a *SpaceActions) RemoveMember(control *runtime.Control, input inputs_spaces.RemoveMemberInput, info models.Info) (any, error) {
	admin := models.Admin{}
	err := control.Trx.Where("space_id = ?", info.Member.SpaceId).Where("user_id = ?", info.User.Id).First(&admin).Error()
	if err != nil {
		return nil, err
	}
	member := models.Member{Id: input.MemberId}
	err2 := control.Trx.First(&member).Error()
	if err2 != nil {
		return nil, err2
	}
	control.Trx.Delete(&member)
	control.Adapters().Cache().Del(fmt.Sprintf(memberTemplate, member.SpaceId, member.UserId))
	go control.Signaler().SignalGroup("spaces/removeMember", info.Member.SpaceId, updates_spaces.AddMember{SpaceId: info.Member.SpaceId, Member: info.Member}, true, []string{info.User.Id})
	return outputs_spaces.AddMemberOutput{Member: member}, nil
}

// Create /spaces/create check [ true false false ] access [ true false false false POST ]
func (a *SpaceActions) Create(control *runtime.Control, input inputs_spaces.CreateInput, info models.Info) (any, error) {
	space := models.Space{Id: utils.SecureUniqueId(control.AppId), Tag: input.Tag + "@" + control.AppId, Title: input.Title, Avatar: input.Avatar, IsPublic: input.IsPublic}
	control.Trx.Create(&space)
	member := models.Member{Id: utils.SecureUniqueId(control.AppId), UserId: info.User.Id, SpaceId: space.Id, TopicIds: "*", Metadata: ""}
	control.Trx.Create(&member)
	admin := models.Admin{Id: utils.SecureUniqueId(control.AppId), UserId: info.User.Id, SpaceId: space.Id, Role: "creator"}
	control.Trx.Create(&admin)
	control.Signaler().JoinGroup(member.SpaceId, member.UserId)
	control.Adapters().Cache().Put(fmt.Sprintf(memberTemplate, member.SpaceId, member.UserId), "true")
	return outputs_spaces.CreateOutput{Space: space, Member: member}, nil
}

// Update /spaces/update check [ true false false ] access [ true false false false PUT ]
func (a *SpaceActions) Update(control *runtime.Control, input inputs_spaces.UpdateInput, info models.Info) (any, error) {
	admin := models.Admin{}
	err := control.Trx.Where("user_id=?", info.User.Id).Where("space_id=?", input.SpaceId).First(&admin).Error()
	if err != nil {
		return nil, err
	}
	space := models.Space{Id: input.SpaceId}
	control.Trx.First(&space)
	space.Title = input.Title
	space.Avatar = input.Avatar
	space.Tag = input.Tag + "@" + control.AppId
	space.IsPublic = input.IsPublic
	control.Trx.Save(&space)
	go control.Signaler().SignalGroup("spaces/update", space.Id, updates_spaces.Update{Space: space}, true, []string{info.User.Id})
	return outputs_spaces.UpdateOutput{Space: space}, nil
}

// Delete /spaces/delete check [ true false false ] access [ true false false false DELETE ]
func (a *SpaceActions) Delete(control *runtime.Control, input inputs_spaces.DeleteInput, info models.Info) (any, error) {
	admin := models.Admin{}
	err := control.Trx.Where("user_id=?", info.User.Id).Where("space_id=?", input.SpaceId).First(&admin).Error()
	if err != nil {
		return nil, err
	}
	if admin.Role != "creator" {
		return nil, errors.New("you are not the space creator")
	}
	space := models.Space{Id: input.SpaceId}
	err2 := control.Trx.First(&space).Error()
	if err2 != nil {
		return nil, err2
	}
	control.Trx.Delete(&space)
	go control.Signaler().SignalGroup("spaces/delete", space.Id, updates_spaces.Delete{Space: space}, true, []string{info.User.Id})
	return outputs_spaces.DeleteOutput{Space: space}, nil
}

// Get /spaces/get check [ true false false ] access [ true false false false GET ]
func (a *SpaceActions) Get(control *runtime.Control, input inputs_spaces.GetInput, info models.Info) (any, error) {
	space := models.Space{Id: input.SpaceId}
	control.Trx.First(&space)
	if space.IsPublic {
		return outputs_spaces.GetOutput{Space: space}, nil
	}
	member := models.Member{}
	err := control.Trx.Where("space_id = ?", input.SpaceId).Where("user_id = ?", info.User.Id).First(&member).Error()
	if err != nil {
		return nil, errors.New("space not found")
	}
	return outputs_spaces.GetOutput{Space: space}, nil
}

// Join /spaces/join check [ true false false ] access [ true false false false POST ]
func (a *SpaceActions) Join(control *runtime.Control, input inputs_spaces.JoinInput, info models.Info) (any, error) {
	space := models.Space{Id: input.SpaceId}
	err := control.Trx.First(&space).Error()
	if err != nil {
		return nil, err
	}
	if !space.IsPublic {
		return nil, errors.New("access to private space denied")
	}
	member := models.Member{Id: utils.SecureUniqueId(control.AppId), UserId: info.User.Id, SpaceId: input.SpaceId, TopicIds: "*", Metadata: ""}
	err2 := control.Trx.Create(&member).Error()
	if err2 != nil {
		return nil, err2
	}
	control.Signaler().JoinGroup(member.SpaceId, member.UserId)
	control.Adapters().Cache().Put(fmt.Sprintf(memberTemplate, member.SpaceId, member.UserId), "true")
	go control.Signaler().SignalGroup("spaces/join", member.SpaceId, updates_spaces.Join{Member: member}, true, []string{member.UserId})
	return outputs_spaces.JoinOutput{Member: member}, nil
}
