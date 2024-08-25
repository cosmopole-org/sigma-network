package abstract

type ICore interface {
	Id() string
	Gods() []string
	Layers() []ILayer
	Load([]string, []ILayer, []interface{})
	Push(ILayer)
	Get(int) ILayer
	Utils() IUtils
}
