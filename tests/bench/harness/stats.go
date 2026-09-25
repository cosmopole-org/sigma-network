package main

import (
	"fmt"
	"math"
	"os"
	"sort"
	"strconv"
	"strings"
	"time"
)

// ---------------------------------------------------------------- latency

type Latencies struct {
	mu []time.Duration
}

func (l *Latencies) Add(d time.Duration) { l.mu = append(l.mu, d) }
func (l *Latencies) Len() int            { return len(l.mu) }

type Summary struct {
	N      int     `json:"n"`
	MeanMs float64 `json:"mean_ms"`
	P50Ms  float64 `json:"p50_ms"`
	P95Ms  float64 `json:"p95_ms"`
	P99Ms  float64 `json:"p99_ms"`
	MaxMs  float64 `json:"max_ms"`
	StdMs  float64 `json:"std_ms"`
}

func (l *Latencies) Summary() Summary {
	if len(l.mu) == 0 {
		return Summary{}
	}
	s := make([]time.Duration, len(l.mu))
	copy(s, l.mu)
	sort.Slice(s, func(i, j int) bool { return s[i] < s[j] })
	ms := func(d time.Duration) float64 { return float64(d.Nanoseconds()) / 1e6 }
	pct := func(p float64) float64 {
		idx := int(math.Ceil(p*float64(len(s)))) - 1
		if idx < 0 {
			idx = 0
		}
		if idx >= len(s) {
			idx = len(s) - 1
		}
		return ms(s[idx])
	}
	var sum, sumsq float64
	for _, d := range s {
		sum += ms(d)
		sumsq += ms(d) * ms(d)
	}
	mean := sum / float64(len(s))
	return Summary{
		N: len(s), MeanMs: mean, P50Ms: pct(0.50), P95Ms: pct(0.95),
		P99Ms: pct(0.99), MaxMs: ms(s[len(s)-1]),
		StdMs: math.Sqrt(math.Max(0, sumsq/float64(len(s))-mean*mean)),
	}
}

// ---------------------------------------------------------------- /proc sampling

// ProcSampler reads a process's CPU time and resident set size from /proc so
// that resource use is attributed to the server under test, not to the whole
// machine (which also runs the load generator, PostgreSQL and Redis).
type ProcSampler struct {
	pid      int
	interval time.Duration
	stop     chan struct{}
	done     chan struct{}

	RSSSamplesMB []float64
	CPUPercent   []float64
	Threads      []int
}

type ResourceSummary struct {
	PID          int     `json:"pid"`
	CPUMeanPct   float64 `json:"cpu_mean_pct"`
	CPUPeakPct   float64 `json:"cpu_peak_pct"`
	RSSMeanMB    float64 `json:"rss_mean_mb"`
	RSSPeakMB    float64 `json:"rss_peak_mb"`
	ThreadsMean  float64 `json:"threads_mean"`
	SampleCount  int     `json:"samples"`
	CPUCoresUsed float64 `json:"cpu_cores_used"`
}

func NewProcSampler(pid int, interval time.Duration) *ProcSampler {
	return &ProcSampler{pid: pid, interval: interval, stop: make(chan struct{}), done: make(chan struct{})}
}

func readProcStat(pid int) (utime, stime uint64, threads int, ok bool) {
	b, err := os.ReadFile(fmt.Sprintf("/proc/%d/stat", pid))
	if err != nil {
		return 0, 0, 0, false
	}
	s := string(b)
	// the comm field may contain spaces; fields are counted after the final ')'
	i := strings.LastIndex(s, ")")
	if i < 0 {
		return 0, 0, 0, false
	}
	f := strings.Fields(s[i+2:])
	if len(f) < 20 {
		return 0, 0, 0, false
	}
	utime, _ = strconv.ParseUint(f[11], 10, 64) // field 14 overall
	stime, _ = strconv.ParseUint(f[12], 10, 64)
	threads, _ = strconv.Atoi(f[17])
	return utime, stime, threads, true
}

func readRSSMB(pid int) float64 {
	b, err := os.ReadFile(fmt.Sprintf("/proc/%d/status", pid))
	if err != nil {
		return 0
	}
	for _, line := range strings.Split(string(b), "\n") {
		if strings.HasPrefix(line, "VmRSS:") {
			f := strings.Fields(line)
			if len(f) >= 2 {
				kb, _ := strconv.ParseFloat(f[1], 64)
				return kb / 1024
			}
		}
	}
	return 0
}

func (p *ProcSampler) Start() {
	go func() {
		defer close(p.done)
		ticks := float64(100) // CLK_TCK
		lastU, lastS, _, ok := readProcStat(p.pid)
		if !ok {
			return
		}
		last := time.Now()
		t := time.NewTicker(p.interval)
		defer t.Stop()
		for {
			select {
			case <-p.stop:
				return
			case now := <-t.C:
				u, s, th, ok := readProcStat(p.pid)
				if !ok {
					return
				}
				dt := now.Sub(last).Seconds()
				cpu := (float64(u-lastU) + float64(s-lastS)) / ticks / dt * 100
				p.CPUPercent = append(p.CPUPercent, cpu)
				p.RSSSamplesMB = append(p.RSSSamplesMB, readRSSMB(p.pid))
				p.Threads = append(p.Threads, th)
				lastU, lastS, last = u, s, now
			}
		}
	}()
}

func (p *ProcSampler) Stop() ResourceSummary {
	close(p.stop)
	<-p.done
	mean := func(v []float64) float64 {
		if len(v) == 0 {
			return 0
		}
		var s float64
		for _, x := range v {
			s += x
		}
		return s / float64(len(v))
	}
	peak := func(v []float64) float64 {
		var m float64
		for _, x := range v {
			if x > m {
				m = x
			}
		}
		return m
	}
	thf := make([]float64, len(p.Threads))
	for i, t := range p.Threads {
		thf[i] = float64(t)
	}
	cm := mean(p.CPUPercent)
	return ResourceSummary{
		PID: p.pid, CPUMeanPct: cm, CPUPeakPct: peak(p.CPUPercent),
		RSSMeanMB: mean(p.RSSSamplesMB), RSSPeakMB: peak(p.RSSSamplesMB),
		ThreadsMean: mean(thf), SampleCount: len(p.CPUPercent),
		CPUCoresUsed: cm / 100,
	}
}
