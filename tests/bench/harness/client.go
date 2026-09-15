package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"time"
)

// Sigma is a thin client for the home-server REST surface, used to set up the
// fixtures a benchmark needs (users, spaces, topics, plugged Wasm modules).
type Sigma struct {
	Base string
	HTTP *http.Client
}

func NewSigma(base string) *Sigma {
	return &Sigma{Base: base, HTTP: &http.Client{Timeout: 60 * time.Second}}
}

func (s *Sigma) Call(path string, body any, token string, layer int) (map[string]any, error) {
	b, _ := json.Marshal(body)
	req, _ := http.NewRequest("POST", s.Base+path, bytes.NewReader(b))
	req.Header.Set("Content-Type", "application/json")
	if token != "" {
		req.Header.Set("Token", token)
	}
	if layer > 0 {
		req.Header.Set("Layer", fmt.Sprint(layer))
	}
	resp, err := s.HTTP.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	raw, _ := io.ReadAll(resp.Body)
	if resp.StatusCode >= 400 {
		return nil, fmt.Errorf("%s -> %d: %s", path, resp.StatusCode, string(raw))
	}
	var out map[string]any
	if len(raw) > 0 {
		_ = json.Unmarshal(raw, &out)
	}
	return out, nil
}

type Account struct {
	UserID string
	Token  string
}

func (s *Sigma) CreateUser(username, typ string) (Account, error) {
	body := map[string]any{"username": username, "secret": "bench", "name": "bench",
		"avatar": "a", "publicKey": "k"}
	if typ != "" {
		body["type"] = typ
	}
	out, err := s.Call("/users/create", body, "", 1)
	if err != nil {
		return Account{}, err
	}
	user, _ := out["user"].(map[string]any)
	sess, _ := out["session"].(map[string]any)
	if user == nil || sess == nil {
		return Account{}, fmt.Errorf("unexpected create response: %v", out)
	}
	return Account{UserID: user["id"].(string), Token: sess["token"].(string)}, nil
}

func (s *Sigma) CreateSpace(token, tag string) (spaceID, memberID string, err error) {
	out, err := s.Call("/spaces/create", map[string]any{
		"tag": tag, "title": "bench", "avatar": "a", "isPublic": true}, token, 1)
	if err != nil {
		return "", "", err
	}
	space, _ := out["space"].(map[string]any)
	member, _ := out["member"].(map[string]any)
	if space == nil {
		return "", "", fmt.Errorf("unexpected space response: %v", out)
	}
	mid := ""
	if member != nil {
		mid, _ = member["id"].(string)
	}
	return space["id"].(string), mid, nil
}

func (s *Sigma) CreateTopic(token, spaceID string) (string, error) {
	out, err := s.Call("/topics/create", map[string]any{
		"title": "bench", "avatar": "a", "spaceId": spaceID, "metadata": "{}"}, token, 1)
	if err != nil {
		return "", err
	}
	topic, _ := out["topic"].(map[string]any)
	if topic == nil {
		return "", fmt.Errorf("unexpected topic response: %v", out)
	}
	return topic["id"].(string), nil
}

func (s *Sigma) AddMember(token, userID, spaceID, topicID string) (string, error) {
	out, err := s.Call("/spaces/addMember", map[string]any{
		"userId": userID, "spaceId": spaceID, "topicId": topicID, "metadata": "{}"}, token, 1)
	if err != nil {
		return "", err
	}
	member, _ := out["member"].(map[string]any)
	if member == nil {
		return "", fmt.Errorf("unexpected addMember response: %v", out)
	}
	return member["id"].(string), nil
}

// Plug uploads a Wasm module and registers the actions it implements.
func (s *Sigma) Plug(token, key, wasmPath string, actions []string) error {
	wasm, err := os.ReadFile(wasmPath)
	if err != nil {
		return err
	}
	type guard struct {
		IsUser    bool `json:"isUser"`
		IsInSpace bool `json:"isInSpace"`
		IsInTopic bool `json:"isInTopic"`
	}
	type meta struct {
		Key   string `json:"key"`
		Path  string `json:"path"`
		Guard guard  `json:"guard"`
	}
	ms := make([]meta, 0, len(actions))
	for _, a := range actions {
		ms = append(ms, meta{Key: a, Path: "/" + a, Guard: guard{}})
	}
	metaJSON, _ := json.Marshal(ms)

	var buf bytes.Buffer
	w := multipart.NewWriter(&buf)
	_ = w.WriteField("key", key)
	_ = w.WriteField("meta", string(metaJSON))
	fw, _ := w.CreateFormFile("file", "module.wasm")
	_, _ = fw.Write(wasm)
	_ = w.Close()

	req, _ := http.NewRequest("POST", s.Base+"/plugins/plug", &buf)
	req.Header.Set("Content-Type", w.FormDataContentType())
	req.Header.Set("Token", token)
	req.Header.Set("Layer", "2")
	resp, err := s.HTTP.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	raw, _ := io.ReadAll(resp.Body)
	if resp.StatusCode >= 400 {
		return fmt.Errorf("plug -> %d: %s", resp.StatusCode, string(raw))
	}
	return nil
}
