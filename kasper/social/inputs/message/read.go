package inputs_message

type ReadMessagesInput struct {
	TopicId string `json:"topicId" validate:"required"`
	Offset  *int   `json:"offset" validate:"required"`
	Count   *int   `json:"count" validate:"required"`
}

func (d ReadMessagesInput) GetSpaceId() string {
	return ""
}

func (d ReadMessagesInput) GetTopicId() string {
	return d.TopicId
}

func (d ReadMessagesInput) GetMemberId() string {
	return ""
}
