package abstract

type ICore interface {
	Id() string
	Layers() []ILayer
	Load([]ILayer, []interface{})
	Push(ILayer)
	Get(int) ILayer
	Utils() IUtils
}
