package admin_model

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

type Meta struct {
	Id   string `json:"id" gorm:"primaryKey;column:id"`
	Data Json   `json:"data" gorm:"column:data"`
}
