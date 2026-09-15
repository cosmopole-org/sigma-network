package main

import (
	"encoding/binary"
	"encoding/json"
	"fmt"
	"os"
	"runtime"
	"time"

	"github.com/second-state/WasmEdge-go/wasmedge"
)

// VMHandle wraps one WasmEdge micro-VM the way the home server holds one per
// (topic, member): loaded once, then called repeatedly.
type VMHandle struct {
	vm *wasmedge.VM
}

func NewVM(path string) (*VMHandle, error) {
	conf := wasmedge.NewConfigure(wasmedge.REFERENCE_TYPES)
	conf.AddConfig(wasmedge.WASI)
	vm := wasmedge.NewVMWithConfig(conf)
	wasi := vm.GetImportModule(wasmedge.WASI)
	wasi.InitWasi([]string{}, []string{}, []string{".:."})
	if err := vm.LoadWasmFile(path); err != nil {
		return nil, err
	}
	if err := vm.Validate(); err != nil {
		return nil, err
	}
	if err := vm.Instantiate(); err != nil {
		return nil, err
	}
	names, _ := vm.GetFunctionList()
	entry := "_start"
	for _, n := range names {
		if n == "_initialize" {
			entry = "_initialize"
		}
	}
	if _, err := vm.Execute(entry); err != nil {
		return nil, err
	}
	return &VMHandle{vm: vm}, nil
}

func (h *VMHandle) Release() { h.vm.Release() }

// Call reproduces exactly what the server does per action: allocate guest
// memory for key and body, copy both in, call run, read the result back out,
// and free the input. This is the full cost of crossing the sandbox boundary.
func (h *VMHandle) Call(key, body string) ([]byte, error) {
	vm := h.vm
	kr, err := vm.Execute("malloc", int32(len(key)+1))
	if err != nil {
		return nil, err
	}
	kp := kr[0].(int32)
	br, err := vm.Execute("malloc", int32(len(body)+1))
	if err != nil {
		return nil, err
	}
	bp := br[0].(int32)

	mod := vm.GetActiveModule()
	mem := mod.FindMemory("memory")
	km, err := mem.GetData(uint(kp), uint(len(key)+1))
	if err != nil {
		return nil, err
	}
	copy(km, key)
	km[len(key)] = 0
	bm, err := mem.GetData(uint(bp), uint(len(body)+1))
	if err != nil {
		return nil, err
	}
	copy(bm, body)
	bm[len(body)] = 0

	res, err := vm.Execute("run", int32(len(key)), kp, int32(len(body)), bp)
	if err != nil {
		return nil, err
	}
	if len(res) == 0 {
		return nil, fmt.Errorf("empty result")
	}
	out := res[0].(int32)
	head, err := mem.GetData(uint(out), 8)
	if err != nil {
		return nil, err
	}
	ptr := binary.LittleEndian.Uint32(head[:4])
	length := binary.LittleEndian.Uint32(head[4:])
	data, err := mem.GetData(uint(ptr), uint(length))
	if err != nil {
		return nil, err
	}
	cp := make([]byte, len(data))
	copy(cp, data)
	if _, err := vm.Execute("free", bp); err != nil {
		return nil, err
	}
	if _, err := vm.Execute("free", kp); err != nil {
		return nil, err
	}
	return cp, nil
}

// nativeEcho is the in-process baseline: the same decode/encode a bot action
// performs, with no sandbox boundary to cross.
func nativeEcho(body string) []byte {
	var in map[string]any
	if err := json.Unmarshal([]byte(body), &in); err != nil {
		return []byte(`{"error":"bad input"}`)
	}
	out, _ := json.Marshal(map[string]any{"echo": in["payload"], "n": len(body)})
	return out
}

type VMCallResult struct {
	Mode         string  `json:"mode"`
	PayloadBytes int     `json:"payload_bytes"`
	Iterations   int     `json:"iterations"`
	Summary      Summary `json:"latency"`
	OpsPerSec    float64 `json:"ops_per_sec"`
}

func benchVMCalls(modulePath string, sizes []int, iterations int) []VMCallResult {
	var out []VMCallResult
	h, err := NewVM(modulePath)
	if err != nil {
		panic(err)
	}
	defer h.Release()

	for _, size := range sizes {
		payload := make([]byte, size)
		for i := range payload {
			payload[i] = 'x'
		}
		body, _ := json.Marshal(map[string]any{"payload": string(payload)})

		// Large payloads are expensive inside the guest; scale the iteration
		// count so every size gets a stable estimate in bounded time.
		iters := iterations
		if size >= 16384 {
			iters = iterations / 4
		}
		if size >= 65536 {
			iters = iterations / 10
		}
		if iters < 100 {
			iters = 100
		}

		// The boundary alone: no decoding inside the guest.
		for i := 0; i < 100; i++ {
			if _, err := h.Call("bench/noop", string(body)); err != nil {
				panic(err)
			}
		}
		latN := &Latencies{}
		startN := time.Now()
		for i := 0; i < iters; i++ {
			t := time.Now()
			if _, err := h.Call("bench/noop", string(body)); err != nil {
				panic(err)
			}
			latN.Add(time.Since(t))
		}
		elN := time.Since(startN)
		out = append(out, VMCallResult{Mode: "wasm_boundary_only", PayloadBytes: len(body),
			Iterations: iters, Summary: latN.Summary(),
			OpsPerSec: float64(iters) / elN.Seconds()})

		// warm up
		for i := 0; i < 200; i++ {
			if _, err := h.Call("bench/echo", string(body)); err != nil {
				panic(err)
			}
		}
		lat := &Latencies{}
		start := time.Now()
		for i := 0; i < iters; i++ {
			t := time.Now()
			if _, err := h.Call("bench/echo", string(body)); err != nil {
				panic(err)
			}
			lat.Add(time.Since(t))
		}
		el := time.Since(start)
		out = append(out, VMCallResult{Mode: "wasm_microvm", PayloadBytes: len(body),
			Iterations: iters, Summary: lat.Summary(),
			OpsPerSec: float64(iters) / el.Seconds()})

		// native baseline over the identical payload
		for i := 0; i < 200; i++ {
			nativeEcho(string(body))
		}
		lat2 := &Latencies{}
		start = time.Now()
		for i := 0; i < iters; i++ {
			t := time.Now()
			nativeEcho(string(body))
			lat2.Add(time.Since(t))
		}
		el = time.Since(start)
		out = append(out, VMCallResult{Mode: "native_go", PayloadBytes: len(body),
			Iterations: iters, Summary: lat2.Summary(),
			OpsPerSec: float64(iters) / el.Seconds()})
	}
	return out
}

type VMScaleResult struct {
	VMCount         int     `json:"vm_count"`
	InstantiateMsP50 float64 `json:"instantiate_ms_p50"`
	InstantiateMsP95 float64 `json:"instantiate_ms_p95"`
	RSSTotalMB      float64 `json:"rss_total_mb"`
	RSSPerVMMB      float64 `json:"rss_per_vm_mb"`
	CallP95Ms       float64 `json:"call_p95_ms"`
}

// benchVMScale instantiates many micro-VMs in one process, the way a home
// server holds one per concurrent game, and reports the memory each costs.
func benchVMScale(modulePath string, counts []int) []VMScaleResult {
	var out []VMScaleResult
	self := os.Getpid()
	for _, n := range counts {
		runtime.GC()
		base := readRSSMB(self)
		var vms []*VMHandle
		lat := &Latencies{}
		for i := 0; i < n; i++ {
			t := time.Now()
			h, err := NewVM(modulePath)
			if err != nil {
				panic(err)
			}
			lat.Add(time.Since(t))
			vms = append(vms, h)
		}
		// exercise every VM once so its memory is actually touched
		callLat := &Latencies{}
		for _, h := range vms {
			t := time.Now()
			if _, err := h.Call("bench/move", `{"player":0,"card":0}`); err != nil {
				panic(err)
			}
			callLat.Add(time.Since(t))
		}
		rss := readRSSMB(self)
		s := lat.Summary()
		out = append(out, VMScaleResult{
			VMCount: n, InstantiateMsP50: s.P50Ms, InstantiateMsP95: s.P95Ms,
			RSSTotalMB: rss - base, RSSPerVMMB: (rss - base) / float64(n),
			CallP95Ms: callLat.Summary().P95Ms,
		})
		for _, h := range vms {
			h.Release()
		}
	}
	return out
}
