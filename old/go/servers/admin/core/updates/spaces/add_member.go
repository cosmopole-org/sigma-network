package updates_spaces

type AddMember struct {
	SpaceId string `json:"spaceId"`
	Member  any    `json:"worker"`
}
