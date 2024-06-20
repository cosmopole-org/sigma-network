package models

type ISigmaTool interface {
	Id() string
}

type ISigmaContext interface {
	Layer() int
	GetTool(string) ISigmaTool
}

func UseCtx[T ISigmaTool](context ISigmaContext, toolId string) T {
	return context.GetTool(toolId).(T)
}
