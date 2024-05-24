package config

var federative bool

func PutConfig(fed bool) {
	federative = fed
}

func Federative() bool {
	return federative
}
