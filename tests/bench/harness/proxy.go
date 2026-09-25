package main

import (
	"io"
	"log"
	"net"
	"time"
)

// delayProxy forwards TCP connections after holding every chunk for a fixed
// delay, so that two home servers running on one machine can be measured
// across an emulated wide-area link. Only federation traffic is routed through
// it; client traffic reaches its home server directly.
func delayProxy(listen, target string, delay time.Duration) error {
	ln, err := net.Listen("tcp", listen)
	if err != nil {
		return err
	}
	log.Printf("delay proxy %s -> %s (+%v each way)", listen, target, delay)
	for {
		c, err := ln.Accept()
		if err != nil {
			continue
		}
		go func(in net.Conn) {
			out, err := net.Dial("tcp", target)
			if err != nil {
				in.Close()
				return
			}
			go pipeWithDelay(in, out, delay)
			pipeWithDelay(out, in, delay)
		}(c)
	}
}

func pipeWithDelay(dst, src net.Conn, delay time.Duration) {
	defer dst.Close()
	defer src.Close()
	buf := make([]byte, 32*1024)
	for {
		n, err := src.Read(buf)
		if n > 0 {
			chunk := make([]byte, n)
			copy(chunk, buf[:n])
			if delay > 0 {
				time.Sleep(delay)
			}
			if _, werr := dst.Write(chunk); werr != nil {
				return
			}
		}
		if err != nil {
			if err != io.EOF {
				return
			}
			return
		}
	}
}
