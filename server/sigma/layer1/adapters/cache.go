package adapters

type ICache interface {
	Put(key string, value string)
	Get(key string) string
	Del(key string)
	Infra() any
}
