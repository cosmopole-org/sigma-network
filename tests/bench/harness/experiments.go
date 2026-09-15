package main

import (
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"strings"
	"time"
)

// ---------------------------------------------------------------- E2: federation

type FedResult struct {
	Mode       string  `json:"mode"`
	Iterations int     `json:"iterations"`
	Latency    Summary `json:"latency"`
	AckLatency Summary `json:"ack_latency_ms"`
	Errors     int     `json:"errors"`
}

// runFederation compares the latency of one action executed on the player's
// own home server with the same action executed on a peer home server, over
// the same WebSocket connection and with identical server-side work.
func runFederation(base1, base2, id1, id2, module string, iters int) map[string]any {
	s1, s2 := NewSigma(base1), NewSigma(base2)
	tag := fmt.Sprintf("%d", time.Now().UnixNano())

	dev1, err := s1.CreateUser("fed_dev1_"+tag, "")
	if err != nil {
		panic(err)
	}
	dev2, err := s2.CreateUser("fed_dev2_"+tag, "")
	if err != nil {
		panic(err)
	}
	// the same bot module is installed on both home servers
	if err := s1.Plug(dev1.Token, "fedbot_"+tag, module, []string{"bench/echo", "bench/move"}); err != nil {
		panic(err)
	}
	if err := s2.Plug(dev2.Token, "fedbot_"+tag, module, []string{"bench/echo", "bench/move"}); err != nil {
		panic(err)
	}

	player, err := s1.CreateUser("fed_player_"+tag, "")
	if err != nil {
		panic(err)
	}
	ws, err := DialWS(base1)
	if err != nil {
		panic(err)
	}
	defer ws.Close()
	if err := ws.Authenticate(player.Token); err != nil {
		panic(err)
	}

	body := jsonBody(map[string]any{"payload": strings.Repeat("x", 64)})
	out := map[string]any{}

	// centralized: player and bot on the same home server
	latC := &Latencies{}
	errC := 0
	for i := 0; i < iters+20; i++ {
		_, d, err := ws.Act("/bench/echo", id1, body, 1, 20*time.Second)
		if err != nil {
			errC++
			continue
		}
		if i >= 20 { // discard warm-up
			latC.Add(d)
		}
	}
	out["centralized"] = FedResult{Mode: "centralized", Iterations: latC.Len(),
		Latency: latC.Summary(), Errors: errC}

	// federated: the action is executed by the peer home server
	latF := &Latencies{}
	ackF := &Latencies{}
	errF := 0
	for i := 0; i < iters+20; i++ {
		ack, d, err := ws.ActFederated("/bench/echo", id2, body, 1, 20*time.Second)
		if err != nil {
			errF++
			continue
		}
		if i >= 20 {
			latF.Add(d)
			ackF.Add(ack)
		}
	}
	out["federated"] = FedResult{Mode: "federated", Iterations: latF.Len(),
		Latency: latF.Summary(), AckLatency: ackF.Summary(), Errors: errF}
	return out
}

// ---------------------------------------------------------------- E5: external VM

// runExternalVM measures the external-bot modality: a machine account attached
// over a WebSocket answers a player's action, so the round trip leaves the
// server process and comes back, in contrast to the in-process Wasm micro-VM.
func runExternalVM(base string, iters int) map[string]any {
	s := NewSigma(base)
	tag := fmt.Sprintf("%d", time.Now().UnixNano())

	player, err := s.CreateUser("ext_player_"+tag, "")
	if err != nil {
		panic(err)
	}
	bot, err := s.CreateUser("ext_bot_"+tag, "machine")
	if err != nil {
		panic(err)
	}
	spaceID, playerMember, err := s.CreateSpace(player.Token, "extsp"+tag)
	if err != nil {
		panic(err)
	}
	topicID, err := s.CreateTopic(player.Token, spaceID)
	if err != nil {
		panic(err)
	}
	botMember, err := s.AddMember(player.Token, bot.UserID, spaceID, topicID)
	if err != nil {
		panic(err)
	}

	botWS, err := DialWS(base)
	if err != nil {
		panic(err)
	}
	defer botWS.Close()
	if err := botWS.Authenticate(bot.Token); err != nil {
		panic(err)
	}
	playerWS, err := DialWS(base)
	if err != nil {
		panic(err)
	}
	defer playerWS.Close()
	if err := playerWS.Authenticate(player.Token); err != nil {
		panic(err)
	}

	// the external bot answers every action addressed to it
	go func() {
		for {
			f, err := botWS.WaitUpdate("topics/send", time.Hour)
			if err != nil {
				return
			}
			_ = f
			_, _, _ = botWS.Act("/topics/send", "", jsonBody(map[string]any{
				"type": "single", "spaceId": spaceID, "topicId": topicID,
				"memberId": botMember, "recvId": playerMember,
				"data": `{"type":"response"}`}), 1, 10*time.Second)
		}
	}()

	lat := &Latencies{}
	errs := 0
	for i := 0; i < iters+10; i++ {
		start := time.Now()
		_, _, err := playerWS.Act("/topics/send", "", jsonBody(map[string]any{
			"type": "single", "spaceId": spaceID, "topicId": topicID,
			"memberId": playerMember, "recvId": botMember,
			"data": `{"type":"move"}`}), 1, 10*time.Second)
		if err != nil {
			errs++
			continue
		}
		if _, err := playerWS.WaitUpdate("topics/send", 10*time.Second); err != nil {
			errs++
			continue
		}
		if i >= 10 {
			lat.Add(time.Since(start))
		}
	}
	return map[string]any{"mode": "external_vm_websocket", "latency": lat.Summary(),
		"iterations": lat.Len(), "errors": errs}
}

// ---------------------------------------------------------------- E1: recovery

type RecoveryPhase struct {
	Phase string  `json:"phase"`
	MS    float64 `json:"ms"`
}

type RecoveryRun struct {
	SnapshotEvery   int             `json:"snapshot_every"`
	ActionsApplied  int             `json:"actions_applied"`
	Phases          []RecoveryPhase `json:"phases"`
	TotalMS         float64         `json:"total_ms"`
	ActionsLost     int             `json:"actions_lost"`
	StateMatches    bool            `json:"state_matches"`
	SnapshotBytes   int             `json:"snapshot_bytes"`
	LogEntriesKept  int             `json:"log_entries_replayed"`
}

// runRecovery measures what it costs to bring a game back after the home
// server hosting its Admin Bot is lost.
//
// Two paths are measured against the same real runtime:
//
//	"as shipped"  - the bot's state lives only in the micro-VM, so a restart
//	                starts an empty game: every action is lost.
//	"checkpoint"  - the harness keeps a per-topic command log and asks the bot
//	                for a snapshot every K actions; a replacement VM restores
//	                the newest snapshot and replays the tail.
func runRecovery(module string, actions int, snapshotEvery []int) map[string]any {
	out := map[string]any{}

	// --- as shipped: no checkpoint, no replica
	{
		h, err := NewVM(module)
		if err != nil {
			panic(err)
		}
		for i := 0; i < actions; i++ {
			if _, err := h.Call("bench/move", fmt.Sprintf(`{"player":%d,"card":%d}`, i%4, i)); err != nil {
				panic(err)
			}
		}
		before, _ := h.Call("bench/export", "{}")
		h.Release() // the home server is lost

		start := time.Now()
		h2, err := NewVM(module) // a replacement instance, with nothing to restore
		if err != nil {
			panic(err)
		}
		inst := time.Since(start)
		after, _ := h2.Call("bench/export", "{}")
		h2.Release()

		lostSeq := seqOf(before) - seqOf(after)
		out["as_shipped"] = RecoveryRun{
			SnapshotEvery: -1, ActionsApplied: actions,
			Phases:  []RecoveryPhase{{Phase: "vm_reinstantiate", MS: msOf(inst)}},
			TotalMS: msOf(inst), ActionsLost: lostSeq,
			StateMatches: string(before) == string(after),
		}
	}

	// --- checkpoint and replay
	runs := []RecoveryRun{}
	for _, k := range snapshotEvery {
		h, err := NewVM(module)
		if err != nil {
			panic(err)
		}
		var log []string
		var snapshot []byte
		snapshotSeq := 0

		for i := 0; i < actions; i++ {
			cmd := fmt.Sprintf(`{"player":%d,"card":%d}`, i%4, i)
			if _, err := h.Call("bench/move", cmd); err != nil {
				panic(err)
			}
			log = append(log, cmd)
			if (i+1)%k == 0 {
				snapshot, _ = h.Call("bench/export", "{}")
				snapshotSeq = i + 1
			}
		}
		before, _ := h.Call("bench/export", "{}")
		h.Release() // primary lost

		tail := log[snapshotSeq:]

		start := time.Now()
		h2, err := NewVM(module)
		if err != nil {
			panic(err)
		}
		inst := time.Since(start)

		restoreStart := time.Now()
		if snapshot != nil {
			if _, err := h2.Call("bench/import", string(snapshot)); err != nil {
				panic(err)
			}
		}
		restore := time.Since(restoreStart)

		replayStart := time.Now()
		for _, cmd := range tail {
			if _, err := h2.Call("bench/move", cmd); err != nil {
				panic(err)
			}
		}
		replay := time.Since(replayStart)

		firstStart := time.Now()
		if _, err := h2.Call("bench/move", `{"player":0,"card":999}`); err != nil {
			panic(err)
		}
		first := time.Since(firstStart)

		after, _ := h2.Call("bench/export", "{}")
		h2.Release()

		total := inst + restore + replay + first
		runs = append(runs, RecoveryRun{
			SnapshotEvery: k, ActionsApplied: actions,
			Phases: []RecoveryPhase{
				{Phase: "vm_reinstantiate", MS: msOf(inst)},
				{Phase: "snapshot_restore", MS: msOf(restore)},
				{Phase: "log_replay", MS: msOf(replay)},
				{Phase: "first_action_served", MS: msOf(first)},
			},
			TotalMS: msOf(total), ActionsLost: seqOf(before) - (seqOf(after) - 1),
			StateMatches:   seqOf(after)-1 == seqOf(before),
			SnapshotBytes:  len(snapshot),
			LogEntriesKept: len(tail),
		})
	}
	out["checkpoint_replay"] = runs
	return out
}

func seqOf(b []byte) int {
	var m map[string]any
	if err := json.Unmarshal(b, &m); err != nil {
		return -1
	}
	if v, ok := m["seq"].(float64); ok {
		return int(v)
	}
	return -1
}

func msOf(d time.Duration) float64 { return float64(d.Nanoseconds()) / 1e6 }

// measureServerRestart kills the server process and measures how long it takes
// until the HTTP surface answers again.
func measureServerRestart(startScript string, healthURL string) (killToUp float64, err error) {
	start := time.Now()
	cmd := exec.Command("bash", startScript)
	cmd.Stdout = os.Stderr
	cmd.Stderr = os.Stderr
	if err := cmd.Run(); err != nil {
		return 0, err
	}
	for i := 0; i < 1200; i++ {
		if httpOK(healthURL) {
			return msOf(time.Since(start)), nil
		}
		time.Sleep(50 * time.Millisecond)
	}
	return 0, fmt.Errorf("server did not come back")
}
