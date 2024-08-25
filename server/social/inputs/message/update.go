package inputs_message

type UpdateMessageInput struct {
	TopicId   string `json:"topicId" validate:"required"`
	MessageId string `json:"messageId" validate:"required"`
	Data      Json   `json:"data" validate:"required"`
}

func (d UpdateMessageInput) GetSpaceId() string {
	return ""
}

func (d UpdateMessageInput) GetTopicId() string {
	return d.TopicId
}

func (d UpdateMessageInput) GetMemberId() string {
	return ""
}
