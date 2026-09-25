package inputs_nativegame

// MoveInput is one player action in the native game, mirroring the input the
// WebAssembly build of the same game receives.
type MoveInput struct {
	Player int  `json:"player"`
	Card   int  `json:"card"`
	Reset  bool `json:"reset"`
}

func (d MoveInput) GetData() any      { return "dummy" }
func (d MoveInput) GetSpaceId() string  { return "" }
func (d MoveInput) GetTopicId() string  { return "" }
func (d MoveInput) GetMemberId() string { return "" }

// EchoInput carries an opaque payload, used to measure cost against payload size.
type EchoInput struct {
	Payload string `json:"payload"`
}

func (d EchoInput) GetData() any      { return "dummy" }
func (d EchoInput) GetSpaceId() string  { return "" }
func (d EchoInput) GetTopicId() string  { return "" }
func (d EchoInput) GetMemberId() string { return "" }
