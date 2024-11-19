package abstract

type JsonUpdate struct {
	Entity IModel `json:"entity"`
	Column string `json:"column"`
	Path   string `json:"path"`
	Value  any    `json:"value"`
}

func (m JsonUpdate) Type() string {
	return "Json"
}

type Change struct {
	Method string `json:"method"`
	Typ    string `json:"type"`
	Model  IModel `json:"model"`
}

type IModel interface {
	Type() string
}
