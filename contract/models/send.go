package models

type Send struct {
	User         User   `json:"user"`
	Topic        Topic  `json:"topic"`
	Action       string `json:"action"`
	Data         string `json:"data"`
	Member       Member `json:"member"`
	TargetMember Member `json:"targetMember"`
}
