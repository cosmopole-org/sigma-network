# Sigma benchmark harness

Measures the costs the federated design actually incurs: per-action latency,
sustained request rate, CPU and memory, inter-server overhead, the price of the
WebAssembly sandbox, and what a home-server failure costs a running game.

Everything here runs against the real server (`server/`), the real WasmEdge
runtime and a real bot module — nothing is simulated.

## Layout

| Path | What it is |
| --- | --- |
| `module/` | A TinyGo bot compiled to a WASI *reactor* module. `bench/echo` measures the sandbox boundary, `bench/move` applies one deterministic game action, `bench/export` and `bench/import` snapshot and restore game state. |
| `harness/` | Go load generator: latency percentiles, request rates, `/proc`-based CPU and RSS sampling of the server, a WebSocket client that speaks the home-server protocol, direct WasmEdge micro-benchmarks, and a TCP delay proxy for emulating wide-area links. |
| `results/` | One JSON file per experiment, plus `run_all.log`. |
| `run_all.sh` | Runs E1–E5 end to end. |

## Prerequisites

- WasmEdge 0.13.x (`curl -sSf https://raw.githubusercontent.com/WasmEdge/WasmEdge/master/utils/install_v2.sh | bash -s -- -v 0.13.5`)
- TinyGo 0.39+ to rebuild `module/module_reactor.wasm`
- PostgreSQL and Redis
- Two home servers configured as `n1.local` (port 8081) and `n2.local` (port 8082)

Build:

```bash
cd module  && tinygo build -o module_reactor.wasm -target wasi -buildmode c-shared main.go
cd ../harness && CGO_CFLAGS="-I$HOME/.wasmedge/include" CGO_LDFLAGS="-L$HOME/.wasmedge/lib -lwasmedge" go build -o harness .
```

## Experiments

| ID | Command | Question |
| --- | --- | --- |
| E1 | `harness recover` | What does losing the home server that hosts a game cost, and what does checkpoint-and-replay recovery cost? |
| E2 | `harness fed` | How much latency does federation add over a centralized deployment, at 0/5/25/80 ms link delay? |
| E3 | `harness http` | How do request rate and latency scale with concurrency? |
| E4 | `harness http` (same run) | CPU, resident memory, bandwidth and message rates under load. |
| E5 | `harness vm`, `harness payload`, `harness ws` | Native action vs Wasm micro-VM vs external VM, and per-VM memory at scale. |

Run everything:

```bash
./run_all.sh                       # results/*.json
CONC=1,8,64 DUR=5s ./run_all.sh    # quicker sweep
```

## Emulating a wide-area federation

Both home servers run on one machine, so inter-server traffic is routed through
a TCP delay proxy while client traffic goes straight to its home server:

```bash
./harness/harness proxy -listen 127.0.0.1:9082 -target 127.0.0.1:8082 -delay 25ms &
./harness/harness proxy -listen 127.0.0.1:9081 -target 127.0.0.1:8081 -delay 25ms &
# then point each server's SIGMA_PEERS at the proxy port and restart
```

## Server configuration used by the harness

The server reads these (defaults preserve single-server behaviour):

| Variable | Meaning |
| --- | --- |
| `SIGMA_ID` | This home server's identity, which is also its federation domain |
| `SIGMA_HTTP_PORT` | REST/WebSocket port |
| `SIGMA_CHAIN_PORT` | Port for the hashgraph ledger component |
| `SIGMA_PEERS` | Comma-separated well-known servers: a bare domain, or `<id>=<base-url>` |

## Defects this harness surfaced

Bringing these paths under measurement required fixing them first; each was a
crash or a silently broken path in the server, not a tuning issue.

1. `gossipRoutine` drew a random peer from an empty slice, so a single home
   server panicked on start-up.
2. The Wasm host only ran `_start`, so a WASI command module called
   `proc_exit` and every later call into the instance failed; unchecked
   `Execute` results then panicked the request handler.
3. `injectModule` released the VM it was installing whenever a module
   registered more than one action, freeing the instance its own actions used.
4. No `ws` input parser was registered, so every action invoked over a
   WebSocket dereferenced a nil parser; Wasm actions additionally need the
   global parser the HTTP path already selects.
5. The WebSocket handler answered with the status code instead of the result,
   and never stored the authenticated token.
6. The federation handler indexed layer 0 (layers are 1-based) on forwarded
   packets, and continued after "action not found" into a nil dereference.
7. Two goroutines wrote to the same WebSocket without a lock, which broke
   connections whenever a federated result and its acknowledgement raced.
