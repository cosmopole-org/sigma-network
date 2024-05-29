package updates_spaces

type Create struct {
	SpaceId string `json:"spaceId"`
	Member  any    `json:"worker"`
}
