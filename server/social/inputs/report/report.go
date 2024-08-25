package inputs_report

type ReportInput struct {
	Data map[string]interface{} `json:"data" validate:"required"`
}

func (d ReportInput) GetSpaceId() string {
	return ""
}

func (d ReportInput) GetTopicId() string {
	return ""
}

func (d ReportInput) GetMemberId() string {
	return ""
}
