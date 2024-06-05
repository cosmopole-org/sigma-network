package sigma

type Config struct {
	Id  string
	Log func(...interface{})
}
