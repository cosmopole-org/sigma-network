// Benchmark bot for the Sigma Wasm micro-VM path.
//
// Exposes three actions over the server's Wasm ABI:
//
//	bench/noop   - returns a constant (measures the sandbox boundary alone)
//	bench/echo   - returns the payload it was given (boundary plus the guest's
//	               own JSON decode and encode, as a real bot would pay)
//	bench/move   - applies one deterministic move to in-VM game state
//	               (measures the cost of a real game action)
//	bench/export - serialises the game state (snapshot)
//	bench/import - restores a snapshot (used by the recovery experiment)
//
// Built with: tinygo build -o module.wasm -target wasi main.go
package main

import (
	"encoding/json"
	"strings"
	"unsafe"
)

//go:wasmimport env logData
func logData(a *int32)

//export run
func run(keyLength int32, keyPtr *int32, bodyLength int32, bodyPtr *int32) *int32 {
	key := readString(keyPtr, keyLength)
	body := readString(bodyPtr, bodyLength)

	var output []byte
	switch key {
	case "bench/noop":
		// Returns a constant without decoding the body, so the measurement is
		// the cost of crossing the sandbox boundary alone: guest allocation,
		// the copy in, the call, reading the result back and the free.
		output = []byte(`{"ok":true}`)
	case "bench/echo":
		output = echo(body)
	case "bench/move":
		output = move(body)
	case "bench/export":
		output = export()
	case "bench/import":
		output = importState(body)
	default:
		output = []byte(`{"error":"endpoint not found"}`)
	}
	if len(output) == 0 {
		output = []byte(`{}`)
	}
	r := make([]int32, 2)
	r[0] = int32(uintptr(unsafe.Pointer(&output[0])))
	r[1] = int32(len(output))
	return &r[0]
}

func readString(ptr *int32, length int32) string {
	var b strings.Builder
	base := uintptr(unsafe.Pointer(ptr))
	for i := 0; i < int(length); i++ {
		b.WriteByte(*(*byte)(unsafe.Pointer(base + uintptr(i))))
	}
	return b.String()
}

// ---------------------------------------------------------------- echo

func echo(body string) []byte {
	// Round-trip the payload through the JSON codec a bot would use, so the
	// measurement includes decode and encode rather than a bare memory copy.
	var in map[string]interface{}
	if err := json.Unmarshal([]byte(body), &in); err != nil {
		return []byte(`{"error":"bad input"}`)
	}
	out, err := json.Marshal(map[string]interface{}{"echo": in["payload"], "n": len(body)})
	if err != nil {
		return []byte(`{"error":"bad output"}`)
	}
	return out
}

// ---------------------------------------------------------------- game state

// A deliberately small trick-taking state machine: enough real work per action
// (validation, mutation, scoring) to be representative of a turn-based game,
// and fully deterministic so that replaying a command log reproduces it.
type gameState struct {
	Seq     int            `json:"seq"`
	Turn    int            `json:"turn"`
	Scores  [4]int         `json:"scores"`
	Hands   [4][]int       `json:"hands"`
	Trick   []int          `json:"trick"`
	History []int          `json:"history"`
	Meta    map[string]int `json:"meta"`
}

var state = newGame()

func newGame() *gameState {
	g := &gameState{Meta: map[string]int{}}
	card := 0
	for p := 0; p < 4; p++ {
		g.Hands[p] = make([]int, 0, 13)
		for c := 0; c < 13; c++ {
			g.Hands[p] = append(g.Hands[p], card)
			card++
		}
	}
	return g
}

type moveInput struct {
	Player int `json:"player"`
	Card   int `json:"card"`
	Reset  bool `json:"reset"`
}

func move(body string) []byte {
	var in moveInput
	if err := json.Unmarshal([]byte(body), &in); err != nil {
		return []byte(`{"error":"bad input"}`)
	}
	if in.Reset {
		state = newGame()
		return []byte(`{"ok":true,"seq":0}`)
	}
	if in.Player < 0 || in.Player > 3 {
		return []byte(`{"error":"unknown player"}`)
	}
	if in.Player != state.Turn {
		return []byte(`{"error":"not your turn"}`)
	}
	// remove the played card from the player's hand
	hand := state.Hands[in.Player]
	idx := -1
	for i, c := range hand {
		if c == in.Card {
			idx = i
			break
		}
	}
	if idx < 0 {
		// the card is gone: treat as a pass so long games keep running
		state.Turn = (state.Turn + 1) % 4
		state.Seq++
		out, _ := json.Marshal(map[string]interface{}{"ok": false, "reason": "card not held", "seq": state.Seq})
		return out
	}
	state.Hands[in.Player] = append(hand[:idx], hand[idx+1:]...)
	state.Trick = append(state.Trick, in.Card)
	state.History = append(state.History, in.Card)
	state.Turn = (state.Turn + 1) % 4
	state.Seq++

	winner := -1
	if len(state.Trick) == 4 {
		best, bestPlayer := -1, 0
		for i, c := range state.Trick {
			if c > best {
				best, bestPlayer = c, i
			}
		}
		state.Scores[bestPlayer]++
		state.Trick = state.Trick[:0]
		winner = bestPlayer
	}
	out, _ := json.Marshal(map[string]interface{}{
		"ok": true, "seq": state.Seq, "turn": state.Turn, "winner": winner, "scores": state.Scores,
	})
	return out
}

// importState restores a snapshot produced by bench/export. Together they are
// the state/export and state/import host calls the recovery mechanism needs:
// a replica restores the newest snapshot and replays the log tail onto it.
func importState(body string) []byte {
	var g gameState
	if err := json.Unmarshal([]byte(body), &g); err != nil {
		return []byte(`{"error":"bad snapshot"}`)
	}
	if g.Meta == nil {
		g.Meta = map[string]int{}
	}
	state = &g
	out, _ := json.Marshal(map[string]interface{}{"ok": true, "seq": state.Seq})
	return out
}

func export() []byte {
	out, err := json.Marshal(state)
	if err != nil {
		return []byte(`{"error":"export failed"}`)
	}
	return out
}

func main() {}
