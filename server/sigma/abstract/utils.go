package abstract

type Log func(...interface{})

type IUtils interface {
	Log(...interface{})
}
