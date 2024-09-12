package sigmactx

type ISigmaTool interface {
	Id() string
}

type ISigmaContext interface {
	Layer() int
	GetTool(string) ISigmaTool
}

func Use[T ISigmaTool](context ISigmaContext, toolId string) T {
	return context.GetTool(toolId).(T)
}
