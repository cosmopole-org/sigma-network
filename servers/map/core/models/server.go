package models

type Server struct {
	Host string `json:"host"`
	Port int32  `json:"port"`
}