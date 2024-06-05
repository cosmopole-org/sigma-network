package abstract

type ICore interface {
	Id() string
	Layers() []ILayer
	Push(ILayer)
	Get(int) ILayer
	Utils() IUtils
}
