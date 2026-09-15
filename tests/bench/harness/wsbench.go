package main

import (
	"encoding/json"
	"fmt"
	"strings"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

// WSConn speaks the home server's WebSocket protocol:
//
//	authenticate <token> <requestId>
//	<action-path> <origin> <requestId> <layer> <json-body>
//
// and receives "response <requestId> <json>" / "update <key> <json>" frames.
type WSConn struct {
	c       *websocket.Conn
	mu      sync.Mutex
	waiters map[string]chan wsFrame
	updates chan wsFrame
	closed  bool
}

type wsFrame struct {
	Kind string // "response" | "update" | "error"
	ID   string
	Key  string
	Body string
	At   time.Time
}

func DialWS(base string) (*WSConn, error) {
	url := strings.Replace(base, "http://", "ws://", 1) + "/ws"
	c, _, err := websocket.DefaultDialer.Dial(url, nil)
	if err != nil {
		return nil, err
	}
	w := &WSConn{c: c, waiters: map[string]chan wsFrame{}, updates: make(chan wsFrame, 4096)}
	go w.readLoop()
	return w, nil
}

func (w *WSConn) readLoop() {
	for {
		_, data, err := w.c.ReadMessage()
		if err != nil {
			w.mu.Lock()
			w.closed = true
			for _, ch := range w.waiters {
				close(ch)
			}
			w.waiters = map[string]chan wsFrame{}
			w.mu.Unlock()
			return
		}
		now := time.Now()
		s := string(data)
		parts := strings.SplitN(s, " ", 3)
		if len(parts) < 2 {
			continue
		}
		f := wsFrame{Kind: parts[0], At: now}
		switch parts[0] {
		case "response", "error":
			f.ID = parts[1]
			if len(parts) > 2 {
				f.Body = parts[2]
			}
			// A federated action produces two frames with the same id: the
			// immediate local acknowledgement, and the peer's result once it
			// travels back. Keep the waiter registered so callers can see both.
			w.mu.Lock()
			ch, ok := w.waiters[f.ID]
			w.mu.Unlock()
			if ok {
				select {
				case ch <- f:
				default:
				}
			}
		case "update":
			f.Key = parts[1]
			if len(parts) > 2 {
				f.Body = parts[2]
			}
			select {
			case w.updates <- f:
			default:
			}
		}
	}
}

func (w *WSConn) send(msg string) error {
	w.mu.Lock()
	defer w.mu.Unlock()
	if w.closed {
		return fmt.Errorf("closed")
	}
	return w.c.WriteMessage(websocket.TextMessage, []byte(msg))
}

func (w *WSConn) expect(id string) chan wsFrame {
	ch := make(chan wsFrame, 8)
	w.mu.Lock()
	w.waiters[id] = ch
	w.mu.Unlock()
	return ch
}

func (w *WSConn) unregister(id string) {
	w.mu.Lock()
	delete(w.waiters, id)
	w.mu.Unlock()
}

// FederationAck is the body the origin server returns immediately when it
// forwards an action to the home server that owns the target.
const FederationAck = "request sent to federation"

// ActFederated sends an action addressed to a peer home server and returns the
// time to the local acknowledgement and the time to the peer's actual result.
func (w *WSConn) ActFederated(path, origin, body string, layer int, timeout time.Duration) (ack, result time.Duration, err error) {
	id := fmt.Sprintf("r-%d", time.Now().UnixNano())
	ch := w.expect(id)
	defer w.unregister(id)
	msg := fmt.Sprintf("%s %s %s %d %s", path, origin, id, layer, body)
	start := time.Now()
	if err := w.send(msg); err != nil {
		return 0, 0, err
	}
	// The two frames can arrive in either order: the origin server sends the
	// forwarded request synchronously, so the peer's result often overtakes
	// the local acknowledgement. Collect both.
	deadline := time.After(timeout)
	for {
		select {
		case f, ok := <-ch:
			if !ok {
				return ack, result, fmt.Errorf("connection closed")
			}
			if strings.Contains(f.Body, FederationAck) {
				ack = f.At.Sub(start)
			} else {
				result = f.At.Sub(start)
			}
			if ack > 0 && result > 0 {
				return ack, result, nil
			}
		case <-deadline:
			if result > 0 {
				return ack, result, nil // the result landed; the ack is immaterial
			}
			return ack, 0, fmt.Errorf("timeout waiting for federated result")
		}
	}
}

func (w *WSConn) Authenticate(token string) error {
	id := fmt.Sprintf("auth-%d", time.Now().UnixNano())
	ch := w.expect(id)
	if err := w.send("authenticate " + token + " " + id); err != nil {
		return err
	}
	defer w.unregister(id)
	select {
	case f, ok := <-ch:
		if !ok {
			return fmt.Errorf("connection closed during authentication")
		}
		if f.Kind == "error" {
			return fmt.Errorf("authentication failed: %s", f.Body)
		}
		return nil
	case <-time.After(15 * time.Second):
		return fmt.Errorf("authentication timed out")
	}
}

// Act sends one action and waits for the matching response frame. origin names
// the home server that should execute it: the local server id for a
// centralized call, a peer's id for a federated one.
func (w *WSConn) Act(path, origin, body string, layer int, timeout time.Duration) (wsFrame, time.Duration, error) {
	id := fmt.Sprintf("r-%d", time.Now().UnixNano())
	ch := w.expect(id)
	defer w.unregister(id)
	msg := fmt.Sprintf("%s %s %s %d %s", path, origin, id, layer, body)
	start := time.Now()
	if err := w.send(msg); err != nil {
		return wsFrame{}, 0, err
	}
	select {
	case f, ok := <-ch:
		if !ok {
			return wsFrame{}, 0, fmt.Errorf("connection closed")
		}
		return f, f.At.Sub(start), nil
	case <-time.After(timeout):
		return wsFrame{}, 0, fmt.Errorf("timeout")
	}
}

// WaitUpdate blocks for the next update frame whose key contains match.
func (w *WSConn) WaitUpdate(match string, timeout time.Duration) (wsFrame, error) {
	deadline := time.After(timeout)
	for {
		select {
		case f := <-w.updates:
			if match == "" || strings.Contains(f.Key, match) || strings.Contains(f.Body, match) {
				return f, nil
			}
		case <-deadline:
			return wsFrame{}, fmt.Errorf("timeout waiting for update %q", match)
		}
	}
}

func (w *WSConn) Close() { _ = w.c.Close() }

func jsonBody(v any) string {
	b, _ := json.Marshal(v)
	return string(b)
}
