package model

import (
	"database/sql/driver"
	"encoding/json"
)

type Json map[string]interface{}

func (j Json) Value() (driver.Value, error) {
	b, err := json.Marshal(j)
	return string(b), err
}
func (j *Json) Scan(value interface{}) error {
	return json.Unmarshal([]byte(value.(string)), &j)
}

type Interaction struct {
	Id      int    `json:"id" gorm:"autoIncrement;column:id"`
	UserIds string `json:"userIds" gorm:"uniqueIndex;column:user_ids"`
	State   Json   `json:"state" gorm:"column:state"`
}

func (d Interaction) Type() string {
	return "Interaction"
}

type PreparedInteraction struct {
	UserId   string         `json:"userId"`
	Profile  map[string]any `json:"profile"`
	IsOnline bool           `json:"isOnline"`
	State    Json           `json:"state"`
}