// Package actions_nativegame is the native build of the benchmark game: the
// same deterministic trick-taking logic that tests/bench/module compiles to
// WebAssembly, implemented in Go and compiled into the home server so that the
// two hosting modalities can be compared on identical game logic.
package actions_nativegame

import (
	"sigma/sigma/abstract"
	inputs "sigma/nativegame/inputs"
	"sync"
)

type Actions struct {
	Layer abstract.ILayer
}

func Install(s abstract.IState, a *Actions) error {
	return nil
}

// gameState is the state a game's admin bot owns. The WebAssembly build holds
// the identical structure in its linear memory.
type gameState struct {
	Seq     int            `json:"seq"`
	Turn    int            `json:"turn"`
	Scores  [4]int         `json:"scores"`
	Hands   [4][]int       `json:"hands"`
	Trick   []int          `json:"trick"`
	History []int          `json:"history"`
	Meta    map[string]int `json:"meta"`
}

var (
	// One game is served strictly in turn, as a single authoritative executor,
	// which is the same discipline the micro-VM is held to.
	mu    sync.Mutex
	state = newGame()
)

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

// Move /nativegame/move check [ false false false ] access [ true false false false POST ]
func (a *Actions) Move(_ abstract.IState, input inputs.MoveInput) (any, error) {
	mu.Lock()
	defer mu.Unlock()

	if input.Reset {
		state = newGame()
		return map[string]any{"ok": true, "seq": 0}, nil
	}
	if input.Player < 0 || input.Player > 3 {
		return map[string]any{"error": "unknown player"}, nil
	}
	if input.Player != state.Turn {
		return map[string]any{"error": "not your turn"}, nil
	}

	hand := state.Hands[input.Player]
	idx := -1
	for i, c := range hand {
		if c == input.Card {
			idx = i
			break
		}
	}
	if idx < 0 {
		state.Turn = (state.Turn + 1) % 4
		state.Seq++
		return map[string]any{"ok": false, "reason": "card not held", "seq": state.Seq}, nil
	}
	state.Hands[input.Player] = append(hand[:idx], hand[idx+1:]...)
	state.Trick = append(state.Trick, input.Card)
	state.History = append(state.History, input.Card)
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
	return map[string]any{
		"ok": true, "seq": state.Seq, "turn": state.Turn,
		"winner": winner, "scores": state.Scores,
	}, nil
}

// Echo /nativegame/echo check [ false false false ] access [ true false false false POST ]
func (a *Actions) Echo(_ abstract.IState, input inputs.EchoInput) (any, error) {
	return map[string]any{"echo": input.Payload, "n": len(input.Payload)}, nil
}

// Export /nativegame/export check [ false false false ] access [ true false false false POST ]
func (a *Actions) Export(_ abstract.IState, _ inputs.EchoInput) (any, error) {
	mu.Lock()
	defer mu.Unlock()
	return state, nil
}
