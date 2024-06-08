package abstract

type ILayer interface {
	Core() ICore
	Index() int
	Actor() IActor
	Tools() IToolbox
	ForFill(ICore, ...interface{})
	BackFill(ICore, ...interface{}) []interface{}
	InitSb(builder IStateBuilder) IStateBuilder
	Sb() IStateBuilder
}
