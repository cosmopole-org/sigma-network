package actions_space

import (
	"errors"
	"fmt"
	"sigma/sigma/abstract"
	module_actor_model "sigma/sigma/core/module/actor/model"
	"sigma/sigma/layer1/adapters"
	modulestate "sigma/sigma/layer1/module/state"
	tb "sigma/sigma/layer1/module/toolbox"
	"sigma/sigma/utils/crypto"
	inputsspaces "sigma/sigverse/inputs/spaces"
	inputs_topics "sigma/sigverse/inputs/topics"
	models "sigma/sigverse/model"
	outputsspaces "sigma/sigverse/outputs/spaces"
	outputs_topics "sigma/sigverse/outputs/topics"
	updatesspaces "sigma/sigverse/updates/spaces"

	"gorm.io/gorm/clause"
)

const memberTemplate = "member::%s::%s"

type Actions struct {
	Layer abstract.ILayer
}

func Install(s abstract.IState, a *Actions) error {
	state := abstract.UseState[modulestate.IStateL1](s)
	err := state.Trx().AutoMigrate(&models.Space{})
	if err != nil {
		return err
	}
	err2 := state.Trx().AutoMigrate(&models.Member{})
	if err2 != nil {
		return err2
	}
	err3 := state.Trx().AutoMigrate(&models.Admin{})
	if err3 != nil {
		return err3
	}
	return nil
}

// AddMember /spaces/addMember check [ true true false ] access [ true false false false POST ]
func (a *Actions) AddMember(s abstract.IState, input inputsspaces.AddMemberInput) (any, error) {
	toolbox := abstract.UseToolbox[*tb.ToolboxL1](a.Layer.Tools())
	state := abstract.UseState[modulestate.IStateL1](s)
	var member models.Member
	trx := state.Trx()
	trx.Use()
	err := trx.First(&models.User{Id: input.UserId}).Error()
	if err != nil {
		return nil, err
	}
	member = models.Member{Id: crypto.SecureUniqueId(a.Layer.Core().Id()), UserId: input.UserId, SpaceId: state.Info().SpaceId(), TopicId: "*", Metadata: input.Metadata}
	err2 := trx.Create(&member).Error()
	if err2 != nil {
		return nil, err2
	}
	toolbox.Cache().Put(fmt.Sprintf(memberTemplate, member.SpaceId, member.UserId), "true")
	toolbox.Signaler().JoinGroup(member.SpaceId, member.UserId)
	toolbox.Signaler().SignalUser("spaces/addMemberMe", "", member.UserId, updatesspaces.AddMember{SpaceId: state.Info().SpaceId(), Member: member}, true)
	go toolbox.Signaler().SignalGroup("spaces/addMember", state.Info().SpaceId(), updatesspaces.AddMember{SpaceId: state.Info().SpaceId(), Member: member}, true, []string{state.Info().UserId()})
	return outputsspaces.AddMemberOutput{Member: member}, nil
}

// RemoveMember /spaces/removeMember check [ true true false ] access [ true false false false POST ]
func (a *Actions) RemoveMember(s abstract.IState, input inputsspaces.RemoveMemberInput) (any, error) {
	toolbox := abstract.UseToolbox[*tb.ToolboxL1](a.Layer.Tools())
	state := abstract.UseState[modulestate.IStateL1](s)
	var member models.Member
	trx := state.Trx()
	trx.Use()
	admin := models.Admin{}
	err := trx.Where("space_id = ?", state.Info().SpaceId()).Where("user_id = ?", state.Info().UserId()).First(&admin).Error()
	if err != nil {
		return nil, err
	}
	member = models.Member{Id: input.MemberId}
	err2 := trx.First(&member).Error()
	if err2 != nil {
		return nil, err2
	}
	err3 := trx.Delete(&member).Error()
	if err3 != nil {
		return nil, err3
	}
	toolbox.Cache().Del(fmt.Sprintf(memberTemplate, member.SpaceId, member.UserId))
	toolbox.Signaler().LeaveGroup(member.SpaceId, state.Info().UserId())
	go toolbox.Signaler().SignalGroup("spaces/removeMember", state.Info().SpaceId(), updatesspaces.AddMember{SpaceId: state.Info().SpaceId(), Member: member}, true, []string{state.Info().UserId()})
	return outputsspaces.AddMemberOutput{Member: member}, nil
}

// Create /spaces/create check [ true false false ] access [ true false false false POST ]
func (a *Actions) Create(s abstract.IState, input inputsspaces.CreateInput) (any, error) {
	toolbox := abstract.UseToolbox[*tb.ToolboxL1](a.Layer.Tools())
	state := abstract.UseState[modulestate.IStateL1](s)
	var (
		space  models.Space
		member models.Member
	)
	trx := state.Trx()
	trx.Use()
	space = models.Space{Id: crypto.SecureUniqueId(a.Layer.Core().Id()), Tag: input.Tag + "@" + a.Layer.Core().Id(), Title: input.Title, Avatar: input.Avatar, IsPublic: input.IsPublic}
	err := trx.Create(&space).Error()
	if err != nil {
		return nil, err
	}
	member = models.Member{Id: crypto.SecureUniqueId(a.Layer.Core().Id()), UserId: state.Info().UserId(), SpaceId: space.Id, TopicId: "*", Metadata: ""}
	err2 := trx.Create(&member).Error()
	if err2 != nil {
		return nil, err2
	}
	admin := models.Admin{Id: crypto.SecureUniqueId(a.Layer.Core().Id()), UserId: state.Info().UserId(), SpaceId: space.Id, Role: "creator"}
	err3 := trx.Create(&admin).Error()
	if err3 != nil {
		return nil, err3
	}
	toolbox.Signaler().JoinGroup(member.SpaceId, member.UserId)
	toolbox.Cache().Put(fmt.Sprintf(memberTemplate, member.SpaceId, member.UserId), "true")
	return outputsspaces.CreateOutput{Space: space, Member: member}, nil
}

// Update /spaces/update check [ true false false ] access [ true false false false PUT ]
func (a *Actions) Update(s abstract.IState, input inputsspaces.UpdateInput) (any, error) {
	toolbox := abstract.UseToolbox[*tb.ToolboxL1](a.Layer.Tools())
	state := abstract.UseState[modulestate.IStateL1](s)
	var space models.Space
	trx := state.Trx()
	trx.Use()
	admin := models.Admin{}
	err := trx.Where("user_id=?", state.Info().UserId()).Where("space_id=?", input.SpaceId).First(&admin).Error()
	if err != nil {
		return nil, err
	}
	space = models.Space{Id: input.SpaceId}
	err2 := trx.First(&space).Error()
	if err2 != nil {
		return nil, err2
	}
	space.Title = input.Title
	space.Avatar = input.Avatar
	space.Tag = input.Tag + "@" + a.Layer.Core().Id()
	space.IsPublic = input.IsPublic
	err3 := trx.Save(&space).Error()
	if err3 != nil {
		return nil, err3
	}
	go toolbox.Signaler().SignalGroup("spaces/update", space.Id, updatesspaces.Update{Space: space}, true, []string{state.Info().UserId()})
	return outputsspaces.UpdateOutput{Space: space}, nil
}

// Delete /spaces/delete check [ true false false ] access [ true false false false DELETE ]
func (a *Actions) Delete(s abstract.IState, input inputsspaces.DeleteInput) (any, error) {
	toolbox := abstract.UseToolbox[*tb.ToolboxL1](a.Layer.Tools())
	state := abstract.UseState[modulestate.IStateL1](s)
	var space models.Space
	trx := state.Trx()
	trx.Use()
	admin := models.Admin{}
	err := trx.Where("user_id=?", state.Info().UserId()).Where("space_id=?", input.SpaceId).First(&admin).Error()
	if err != nil {
		return nil, err
	}
	if admin.Role != "creator" {
		return nil, errors.New("you are not the space creator")
	}
	space = models.Space{Id: input.SpaceId}
	err2 := trx.First(&space).Error()
	if err2 != nil {
		return nil, err2
	}
	err3 := trx.Delete(&space).Error()
	if err3 != nil {
		return nil, err3
	}
	toolbox.Signaler().LeaveGroup(space.Id, state.Info().UserId())
	go toolbox.Signaler().SignalGroup("spaces/delete", space.Id, updatesspaces.Delete{Space: space}, true, []string{state.Info().UserId()})
	return outputsspaces.DeleteOutput{Space: space}, nil
}

// Get /spaces/get check [ true false false ] access [ true false false false GET ]
func (a *Actions) Get(s abstract.IState, input inputsspaces.GetInput) (any, error) {
	state := abstract.UseState[modulestate.IStateL1](s)
	var space models.Space
	trx := state.Trx()
	trx.Use()
	space = models.Space{Id: input.SpaceId}
	err := trx.First(&space).Error()
	if err != nil {
		return nil, err
	}
	if space.IsPublic {
		return outputsspaces.GetOutput{Space: space}, nil
	}
	member := models.Member{}
	err2 := trx.Where("space_id = ?", input.SpaceId).Where("user_id = ?", state.Info().UserId()).First(&member).Error()
	if err2 != nil {
		return nil, err2
	}
	return outputsspaces.GetOutput{Space: space}, nil
}

// Read /spaces/read check [ true false false ] access [ true false false false GET ]
func (a *Actions) Read(s abstract.IState, input inputsspaces.ReadInput) (any, error) {
	state := abstract.UseState[modulestate.IStateL1](s)
	var members []models.Member
	trx := state.Trx()
	trx.Use()
	err := trx.Model(&models.Member{}).Where("user_id = ?", state.Info().UserId()).Find(&members).Error()
	if err != nil {
		return nil, err
	}
	trx.Reset()
	ids := []string{}
	for i := 0; i < len(members); i++ {
		ids = append(ids, members[i].SpaceId)
	}
	var spaces []models.Space
	err2 := trx.Model(&models.Space{}).Where("id in ?", ids).Find(&spaces).Error()
	if err2 != nil {
		return nil, err2
	}
	return outputsspaces.ReadOutput{Spaces: spaces}, nil
}

// Join /spaces/join check [ true false false ] access [ true false false false POST ]
func (a *Actions) Join(s abstract.IState, input inputsspaces.JoinInput) (any, error) {
	toolbox := abstract.UseToolbox[*tb.ToolboxL1](a.Layer.Tools())
	state := abstract.UseState[modulestate.IStateL1](s)
	var member models.Member
	trx := state.Trx()
	trx.Use()
	space := models.Space{Id: input.SpaceId}
	err := trx.First(&space).Error()
	if err != nil {
		return nil, err
	}
	if !space.IsPublic {
		return nil, errors.New("access to private space denied")
	}
	member = models.Member{Id: crypto.SecureUniqueId(a.Layer.Core().Id()), UserId: state.Info().UserId(), SpaceId: input.SpaceId, TopicId: "*", Metadata: ""}
	err2 := trx.Create(&member).Error()
	if err2 != nil {
		return nil, err2
	}
	toolbox.Signaler().JoinGroup(member.SpaceId, member.UserId)
	toolbox.Cache().Put(fmt.Sprintf(memberTemplate, member.SpaceId, member.UserId), "true")
	go toolbox.Signaler().SignalGroup("spaces/join", member.SpaceId, updatesspaces.Join{Member: member}, true, []string{member.UserId})
	return outputsspaces.JoinOutput{Member: member}, nil
}

// CreateGroup /spaces/createGroup check [ true false false ] access [ true false false false PUT ]
func (a *Actions) CreateGroup(s abstract.IState, input inputsspaces.CreateGroupInput) (any, error) {
	state := abstract.UseState[modulestate.IStateL1](s)
	var (
		space  models.Space
		member models.Member
		topic  models.Topic
	)
	trx := state.Trx()
	trx.Use()
	_, rawSpaceRes, spaceErr := a.Layer.Core().Get(1).Actor().FetchAction("/spaces/create").Act(a.Layer.Sb().NewState(module_actor_model.NewInfo(state.Info().UserId(), "", ""), trx), inputsspaces.CreateInput{
		Tag:      crypto.SecureUniqueString(),
		Title:    input.Name,
		Avatar:   "0",
		IsPublic: false,
	})
	if spaceErr != nil {
		return nil, spaceErr
	}
	space = rawSpaceRes.(outputsspaces.CreateOutput).Space
	member = rawSpaceRes.(outputsspaces.CreateOutput).Member
	_, rawTopicRes, topicErr := a.Layer.Core().Get(1).Actor().FetchAction("/topics/create").Act(a.Layer.Sb().NewState(module_actor_model.NewInfo(state.Info().UserId(), space.Id, ""), trx), inputs_topics.CreateInput{
		Title:    "main",
		Avatar:   "0",
		Metadata: "{}",
		SpaceId:  space.Id,
	})
	if topicErr != nil {
		return nil, topicErr
	}
	topic = rawTopicRes.(outputs_topics.CreateOutput).Topic
	return outputsspaces.CreateSpaceOutput{Space: space, Topic: topic, Member: member}, nil
}

const requestTemplate = "%s::requested::%s"
const blockTemplate = "%s::blocked::%s"

func getMergedUserIds(userId1 string, userId2 string) string {
	key := ""
	if userId1 > userId2 {
		key = userId1 + "|" + userId2
	} else {
		key = userId2 + "|" + userId1
	}
	return key
}

func getInteractionState(trx adapters.ITrx, myUserId string, receipentId string) (models.Interaction, map[int]bool) {
	key := getMergedUserIds(myUserId, receipentId)
	interaction := models.Interaction{UserIds: key}
	err := trx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("user_ids = ?", key).First(&interaction).Error()
	result := map[int]bool{}
	if interaction.State[fmt.Sprintf(blockTemplate, myUserId, receipentId)] == "true" {
		result[-2] = true
	}
	if err != nil {
		result[-1] = true
	}
	if interaction.State[fmt.Sprintf(blockTemplate, receipentId, myUserId)] == "true" {
		result[2] = true
	}
	if interaction.State[fmt.Sprintf(requestTemplate, myUserId, receipentId)] == "true" {
		result[3] = true
	}
	if interaction.State["areFriends"] == "true" {
		result[4] = true
	}
	return interaction, result
}

// CreatePrivate /spaces/createPrivate check [ true false false ] access [ true false false false PUT ]
func (a *Actions) CreatePrivate(s abstract.IState, input inputsspaces.CreatePrivateInput) (any, error) {
	state := abstract.UseState[modulestate.IStateL1](s)
	var (
		myMember models.Member
		space    models.Space
		topic    models.Topic
	)
	trx := state.Trx()
	trx.Use()
	interaction, codeMap := getInteractionState(trx, state.Info().UserId(), input.ParticipantId)
	if codeMap[-1] {
		return nil, errors.New("interaction not found")
	}
	if codeMap[2] {
		return nil, errors.New("you are blocked by the user")
	}
	if !codeMap[4] {
		return nil, errors.New("you 2 are not friends")
	}
	if interaction.State["spaceId"] != nil {
		return nil, errors.New("private room already exists")
	}
	_, res, createGroupErr := a.Layer.Actor().FetchAction("/spaces/createGroup").Act(a.Layer.Sb().NewState(module_actor_model.NewInfo(state.Info().UserId(), myMember.SpaceId, ""), trx), inputsspaces.CreateGroupInput{
		Name: "private_space",
	})
	if createGroupErr != nil {
		return nil, createGroupErr
	}
	groupRes := res.(outputsspaces.CreateSpaceOutput)
	space = groupRes.Space
	myMember = groupRes.Member
	topic = groupRes.Topic
	_, _, addMemberErr := a.Layer.Actor().FetchAction("/spaces/addMember").Act(a.Layer.Sb().NewState(module_actor_model.NewInfo(state.Info().UserId(), myMember.SpaceId, ""), trx), inputsspaces.AddMemberInput{
		UserId:   input.ParticipantId,
		SpaceId:  groupRes.Space.Id,
		Metadata: "",
	})
	if addMemberErr != nil {
		return nil, addMemberErr
	}
	interaction.State["spaceId"] = space.Id
	interaction.State["topicId"] = topic.Id
	err2 := trx.Save(&interaction).Error()
	if err2 != nil {
		return nil, err2
	}
	return outputsspaces.CreateSpaceOutput{Space: space, Member: myMember, Topic: topic}, nil
}
