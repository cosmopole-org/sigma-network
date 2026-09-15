#!/bin/bash
# Runs the full experiment set (E1-E5) and writes one JSON file per experiment
# into results/. Expects two home servers configured as in README.md.
set -u
cd "$(dirname "$0")"
export LD_LIBRARY_PATH=/root/.wasmedge/lib
H=./harness/harness
MODULE=./module/module_reactor.wasm
R=./results
RUN_DIR=${SIGMA_RUN_DIR:-/home/user/sigma-run}

pid_of() { pgrep -x sigma-server | sed -n "$1p"; }

restart_nodes() {
  pkill -x sigma-server 2>/dev/null
  sleep 2
  # direct peer URLs (no emulated link)
  sed -i "s|^SIGMA_PEERS=.*|SIGMA_PEERS=n2.local=http://127.0.0.1:8082|" "$RUN_DIR/node1/.env"
  sed -i "s|^SIGMA_PEERS=.*|SIGMA_PEERS=n1.local=http://127.0.0.1:8081|" "$RUN_DIR/node2/.env"
  bash "$RUN_DIR/start_node1.sh"
  bash "$RUN_DIR/start_node2.sh"
  sleep 15
}

echo "=== E5a: Wasm micro-VM vs native Go, and per-VM memory ==="
$H vm -module $MODULE -iters "${VM_ITERS:-2000}" -sizes 64,256,1024,4096,16384,65536 \
     -vms "${VM_COUNTS:-1,10,50,100,250}" -out $R/e5_vm.json

echo "=== E3/E4: request rate, latency and resources vs concurrency ==="
restart_nodes
PID1=$(pid_of 1)
$H http -module $MODULE -pid "$PID1" -conc "${CONC:-1,2,4,8,16,32,64,128}" \
     -dur "${DUR:-10s}" -warmup 3s -out $R/e3_e4_http.json

echo "=== E5b: payload sweep through the server ==="
PID1=$(pid_of 1)
$H payload -pid "$PID1" -sizes 64,1024,16384,65536 -conc 8 -dur 8s -out $R/e5_payload.json

echo "=== E5c: external-VM bot over WebSocket ==="
$H ws -iters "${WS_ITERS:-300}" -out $R/e5_external.json

echo "=== E2: centralized vs federated, emulated link delays ==="
for D in 0ms 5ms 25ms 80ms; do
  pkill -x harness 2>/dev/null
  sleep 1
  if [ "$D" != "0ms" ]; then
    $H proxy -listen 127.0.0.1:9082 -target 127.0.0.1:8082 -delay "$D" &
    $H proxy -listen 127.0.0.1:9081 -target 127.0.0.1:8081 -delay "$D" &
    sleep 1
    SIGMA_PEERS_1="n2.local=http://127.0.0.1:9082" SIGMA_PEERS_2="n1.local=http://127.0.0.1:9081" \
      bash "$RUN_DIR/restart_with_proxy.sh"
  else
    restart_nodes
  fi
  $H fed -module $MODULE -iters "${FED_ITERS:-300}" -out "$R/e2_fed_${D}.json"
done
pkill -x harness 2>/dev/null
restart_nodes

echo "=== E1: failure and recovery ==="
$H recover -module $MODULE -actions "${REC_ACTIONS:-200}" -k 1,8,16,64 \
     -restart-script "$RUN_DIR/start_node1.sh" -health http://127.0.0.1:8081/ \
     -out $R/e1_recovery.json

echo "all experiments finished"
ls -la $R
