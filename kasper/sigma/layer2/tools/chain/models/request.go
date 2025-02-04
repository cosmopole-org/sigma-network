package hashgraph_models

type Request struct {
	Path   string `json:"path"`
	Layer  int    `json:"layer"`
	Input  string `json:"input"`
	Token  string `json:"token"`
	Origin string `json:"origin"`
}
