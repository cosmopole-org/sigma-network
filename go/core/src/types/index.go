package types

type Method struct {
    key string
    callback  func(args map[string]any)
}

type Service struct {
	key string
	methods map[string]Method
}
