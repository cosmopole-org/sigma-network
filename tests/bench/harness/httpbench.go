package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"sync"
	"sync/atomic"
	"time"
)

type HTTPResult struct {
	Name          string          `json:"name"`
	Path          string          `json:"path"`
	Concurrency   int             `json:"concurrency"`
	DurationSec   float64         `json:"duration_sec"`
	Requests      int64           `json:"requests"`
	Errors        int64           `json:"errors"`
	Throughput    float64         `json:"req_per_sec"`
	BytesSent     int64           `json:"bytes_sent"`
	BytesRecv     int64           `json:"bytes_recv"`
	KBPerSec      float64         `json:"kb_per_sec"`
	BytesPerReq   float64         `json:"bytes_per_req"`
	Latency       Summary         `json:"latency"`
	Resources     ResourceSummary `json:"resources"`
	PayloadBytes  int             `json:"payload_bytes"`
}

type HTTPJob struct {
	Name        string
	URL         string
	Body        []byte
	Headers     map[string]string
	Concurrency int
	Duration    time.Duration
	Warmup      time.Duration
	ServerPID   int
}

func runHTTP(job HTTPJob) HTTPResult {
	client := &http.Client{
		Timeout: 30 * time.Second,
		Transport: &http.Transport{
			MaxIdleConns:        job.Concurrency * 2,
			MaxIdleConnsPerHost: job.Concurrency * 2,
			MaxConnsPerHost:     job.Concurrency * 2,
			DisableCompression:  true,
		},
	}

	var reqs, errs, bytesSent, bytesRecv int64
	var mu sync.Mutex
	lat := &Latencies{}

	ctx, cancel := context.WithCancel(context.Background())
	measuring := int32(0)

	worker := func() {
		local := &Latencies{}
		for {
			select {
			case <-ctx.Done():
				mu.Lock()
				for _, d := range local.mu {
					lat.Add(d)
				}
				mu.Unlock()
				return
			default:
			}
			start := time.Now()
			req, _ := http.NewRequest("POST", job.URL, bytes.NewReader(job.Body))
			req.Header.Set("Content-Type", "application/json")
			for k, v := range job.Headers {
				req.Header.Set(k, v)
			}
			resp, err := client.Do(req)
			if err != nil {
				atomic.AddInt64(&errs, 1)
				continue
			}
			n, _ := io.Copy(io.Discard, resp.Body)
			resp.Body.Close()
			elapsed := time.Since(start)
			if resp.StatusCode >= 400 {
				atomic.AddInt64(&errs, 1)
				continue
			}
			if atomic.LoadInt32(&measuring) == 1 {
				local.Add(elapsed)
				atomic.AddInt64(&reqs, 1)
				atomic.AddInt64(&bytesRecv, n)
				atomic.AddInt64(&bytesSent, int64(len(job.Body)))
			}
		}
	}

	var wg sync.WaitGroup
	for i := 0; i < job.Concurrency; i++ {
		wg.Add(1)
		go func() { defer wg.Done(); worker() }()
	}

	time.Sleep(job.Warmup)
	sampler := NewProcSampler(job.ServerPID, 100*time.Millisecond)
	sampler.Start()
	atomic.StoreInt32(&measuring, 1)
	measureStart := time.Now()
	time.Sleep(job.Duration)
	elapsed := time.Since(measureStart)
	atomic.StoreInt32(&measuring, 0)
	res := sampler.Stop()
	cancel()
	wg.Wait()

	r := HTTPResult{
		Name: job.Name, Path: job.URL, Concurrency: job.Concurrency,
		DurationSec: elapsed.Seconds(), Requests: reqs, Errors: errs,
		Throughput:  float64(reqs) / elapsed.Seconds(),
		BytesSent:   bytesSent, BytesRecv: bytesRecv,
		KBPerSec:    float64(bytesSent+bytesRecv) / 1024 / elapsed.Seconds(),
		Latency:     lat.Summary(), Resources: res,
		PayloadBytes: len(job.Body),
	}
	if reqs > 0 {
		r.BytesPerReq = float64(bytesSent+bytesRecv) / float64(reqs)
	}
	return r
}

func mustJSON(v any) []byte {
	b, err := json.Marshal(v)
	if err != nil {
		panic(err)
	}
	return b
}

func printJSON(v any) {
	b, _ := json.MarshalIndent(v, "", "  ")
	fmt.Println(string(b))
}

func httpOK(url string) bool {
	c := &http.Client{Timeout: 2 * time.Second}
	resp, err := c.Get(url)
	if err != nil {
		return false
	}
	defer resp.Body.Close()
	io.Copy(io.Discard, resp.Body)
	return resp.StatusCode < 500
}
