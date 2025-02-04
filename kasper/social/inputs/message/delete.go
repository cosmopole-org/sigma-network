package inputs_message

type DeleteMessageInput struct {
	TopicId   string `json:"topicId" validate:"required"`
	MessageId string `json:"messageId" validate:"required"`
}

func (d DeleteMessageInput) GetSpaceId() string {
	return ""
}

func (d DeleteMessageInput) GetTopicId() string {
	return d.TopicId
}

func (d DeleteMessageInput) GetMemberId() string {
	return ""
}
