// Benchmark harness for the Sigma federated gaming network.
//
// Sub-commands:
//
//	vm      - micro-VM vs native-Go per-call cost, and per-VM memory at scale
//	http    - request-rate / latency / resource sweep against a running server
//	ws      - WebSocket action path, including the external-VM bot modality
//	fed     - centralized vs federated action latency across two home servers
//	recover - failure and recovery of the home server hosting a game
package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"
)

func writeResult(path string, v any) {
	b, _ := json.MarshalIndent(v, "", "  ")
	if path == "" {
		fmt.Println(string(b))
		return
	}
	if err := os.WriteFile(path, b, 0o644); err != nil {
		panic(err)
	}
	fmt.Fprintf(os.Stderr, "wrote %s\n", path)
}

func parseInts(s string) []int {
	var out []int
	for _, p := range strings.Split(s, ",") {
		p = strings.TrimSpace(p)
		if p == "" {
			continue
		}
		n, err := strconv.Atoi(p)
		if err != nil {
			panic(err)
		}
		out = append(out, n)
	}
	return out
}

func main() {
	if len(os.Args) < 2 {
		fmt.Println("usage: harness <vm|http|ws|fed|recover> [flags]")
		os.Exit(2)
	}
	cmd := os.Args[1]
	args := os.Args[2:]

	switch cmd {
	case "vm":
		fs := flag.NewFlagSet("vm", flag.ExitOnError)
		module := fs.String("module", "../module/module_reactor.wasm", "wasm module")
		sizes := fs.String("sizes", "64,256,1024,4096,16384,65536", "payload sizes")
		iters := fs.Int("iters", 2000, "iterations per size")
		counts := fs.String("vms", "1,10,50,100,250,500", "VM counts for the scale sweep")
		out := fs.String("out", "", "output file")
		_ = fs.Parse(args)

		res := map[string]any{
			"experiment": "E5-vm",
			"calls":      benchVMCalls(*module, parseInts(*sizes), *iters),
			"scale":      benchVMScale(*module, parseInts(*counts)),
			"timestamp":  time.Now().Format(time.RFC3339),
		}
		writeResult(*out, res)

	case "http":
		fs := flag.NewFlagSet("http", flag.ExitOnError)
		base := fs.String("base", "http://127.0.0.1:8081", "server base URL")
		pid := fs.Int("pid", 0, "server pid for resource sampling")
		conc := fs.String("conc", "1,2,4,8,16,32,64,128", "concurrency levels")
		dur := fs.Duration("dur", 10*time.Second, "measurement window per level")
		warm := fs.Duration("warmup", 3*time.Second, "warm-up per level")
		module := fs.String("module", "../module/module_reactor.wasm", "wasm module to plug")
		out := fs.String("out", "", "output file")
		_ = fs.Parse(args)

		s := NewSigma(*base)
		tag := fmt.Sprintf("%d", time.Now().UnixNano())
		dev, err := s.CreateUser("bench_dev_"+tag, "")
		if err != nil {
			panic(err)
		}
		if err := s.Plug(dev.Token, "benchbot_"+tag, *module,
			[]string{"bench/echo", "bench/move", "bench/export"}); err != nil {
			panic(err)
		}
		_, _ = s.Call("/bench/move", map[string]any{"reset": true}, dev.Token, 1)
		_, _ = s.Call("/nativegame/move", map[string]any{"reset": true}, dev.Token, 1)

		var results []HTTPResult
		for _, c := range parseInts(*conc) {
			// 1. the same game implemented natively and compiled into the
			//    server process, reached through the action router
			results = append(results, runHTTP(HTTPJob{
				Name: "native_game_move", URL: *base + "/nativegame/move",
				Body: []byte(`{"player":0,"card":0}`),
				Concurrency: c, Duration: *dur, Warmup: *warm, ServerPID: *pid}))

			// 2. the same game hosted in a Wasm micro-VM
			results = append(results, runHTTP(HTTPJob{
				Name: "wasm_game_move", URL: *base + "/bench/move",
				Body: []byte(`{"player":0,"card":0}`),
				Concurrency: c, Duration: *dur, Warmup: *warm, ServerPID: *pid}))

			// 3. a platform action that authenticates and reads storage, for
			//    context on what the rest of the server costs
			results = append(results, runHTTP(HTTPJob{
				Name: "native_authenticate", URL: *base + "/users/authenticate",
				Body: []byte(`{}`), Headers: map[string]string{"Token": dev.Token},
				Concurrency: c, Duration: *dur, Warmup: *warm, ServerPID: *pid}))
		}
		writeResult(*out, map[string]any{
			"experiment": "E3/E4-http", "results": results,
			"timestamp": time.Now().Format(time.RFC3339)})

	case "payload":
		fs := flag.NewFlagSet("payload", flag.ExitOnError)
		base := fs.String("base", "http://127.0.0.1:8081", "server base URL")
		pid := fs.Int("pid", 0, "server pid")
		sizes := fs.String("sizes", "64,1024,16384,65536", "payload sizes")
		conc := fs.Int("conc", 8, "concurrency")
		dur := fs.Duration("dur", 8*time.Second, "measurement window")
		out := fs.String("out", "", "output file")
		_ = fs.Parse(args)

		var results []HTTPResult
		for _, size := range parseInts(*sizes) {
			payload := strings.Repeat("x", size)
			body := mustJSON(map[string]any{"payload": payload})
			results = append(results, runHTTP(HTTPJob{
				Name: fmt.Sprintf("native_game_echo_%dB", size), URL: *base + "/nativegame/echo",
				Body: body, Concurrency: *conc, Duration: *dur,
				Warmup: 2 * time.Second, ServerPID: *pid}))
			results = append(results, runHTTP(HTTPJob{
				Name: fmt.Sprintf("wasm_game_echo_%dB", size), URL: *base + "/bench/echo",
				Body: body, Concurrency: *conc, Duration: *dur,
				Warmup: 2 * time.Second, ServerPID: *pid}))
		}
		writeResult(*out, map[string]any{
			"experiment": "E5-payload", "results": results,
			"timestamp": time.Now().Format(time.RFC3339)})

	case "proxy":
		fs := flag.NewFlagSet("proxy", flag.ExitOnError)
		listen := fs.String("listen", "127.0.0.1:9082", "listen address")
		target := fs.String("target", "127.0.0.1:8082", "target address")
		delay := fs.Duration("delay", 0, "one-way delay to add")
		_ = fs.Parse(args)
		if err := delayProxy(*listen, *target, *delay); err != nil {
			panic(err)
		}

	case "fed":
		fs := flag.NewFlagSet("fed", flag.ExitOnError)
		base1 := fs.String("base1", "http://127.0.0.1:8081", "home server 1")
		base2 := fs.String("base2", "http://127.0.0.1:8082", "home server 2")
		id1 := fs.String("id1", "n1.local", "server 1 id")
		id2 := fs.String("id2", "n2.local", "server 2 id")
		module := fs.String("module", "../module/module_reactor.wasm", "wasm module")
		iters := fs.Int("iters", 500, "iterations per mode")
		out := fs.String("out", "", "output file")
		_ = fs.Parse(args)
		res := runFederation(*base1, *base2, *id1, *id2, *module, *iters)
		res["experiment"] = "E2-federation"
		res["timestamp"] = time.Now().Format(time.RFC3339)
		writeResult(*out, res)

	case "ws":
		fs := flag.NewFlagSet("ws", flag.ExitOnError)
		base := fs.String("base", "http://127.0.0.1:8081", "home server")
		iters := fs.Int("iters", 300, "iterations")
		out := fs.String("out", "", "output file")
		_ = fs.Parse(args)
		res := runExternalVM(*base, *iters)
		res["experiment"] = "E5-external-vm"
		res["timestamp"] = time.Now().Format(time.RFC3339)
		writeResult(*out, res)

	case "recover":
		fs := flag.NewFlagSet("recover", flag.ExitOnError)
		module := fs.String("module", "../module/module_reactor.wasm", "wasm module")
		actions := fs.Int("actions", 200, "actions applied before the failure")
		ks := fs.String("k", "1,8,16,64", "snapshot intervals")
		restart := fs.String("restart-script", "", "script that restarts the server")
		health := fs.String("health", "http://127.0.0.1:8081/", "health URL")
		out := fs.String("out", "", "output file")
		_ = fs.Parse(args)
		res := runRecovery(*module, *actions, parseInts(*ks))
		if *restart != "" {
			ms, err := measureServerRestart(*restart, *health)
			if err != nil {
				res["server_restart_error"] = err.Error()
			} else {
				res["server_restart_ms"] = ms
			}
		}
		res["experiment"] = "E1-recovery"
		res["timestamp"] = time.Now().Format(time.RFC3339)
		writeResult(*out, res)

	default:
		fmt.Fprintf(os.Stderr, "unknown command %q\n", cmd)
		os.Exit(2)
	}
}
