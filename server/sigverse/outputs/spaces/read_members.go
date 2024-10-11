package outputs_spaces

import (
	models "sigma/sigverse/model"
)

type MemberUser struct {
	Member models.Member     `json:"member"`
	User   models.PublicUser `json:"user"`
}

type ReadMemberOutput struct {
	Members []MemberUser `json:"members"`
}
