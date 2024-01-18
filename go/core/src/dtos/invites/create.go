package dtos_invites

type CreateDto struct {
	HumanId int64 `json:"humanId" validate:"required"`
}

func (d CreateDto) GetData() any {
	return "dummy"
}
