package core

import (
	"encoding/json"
	"strings"
	"unsafe"
)

//go:module env
//export sql
func sql(a *int32) *int32

//go:module env
//export logData
func logData(a *int32)

//export run
func run(keyPtr *int32, bodyPtr *int32) *int32 {
	return Run(keyPtr, bodyPtr)
}

var funcMap = map[string]func(input string) []byte{}
var funcFrame = map[string]interface{}{}

func AddMethod[T any, V any](key string, handler func(input T) V) {
	funcMap[key] = func(input string) []byte {
		var frame T
		json.Unmarshal([]byte(input), &frame)
		result := handler(frame)
		output, _ := json.Marshal(result)
		return output
	}
	funcFrame[key] = *new(T)
}

func PtrToString(subject *int32) string {
	nth := 0
	var subjectStr strings.Builder
	pointer := uintptr(unsafe.Pointer(subject))
	for {
		s := *(*int32)(unsafe.Pointer(pointer + uintptr(nth)))
		if s == 0 {
			break
		}
		subjectStr.WriteByte(byte(s))
		nth++
	}
	return subjectStr.String()
}

func StringToPtr(data string) *int32 {
	p := []byte(data)
	r := make([]int32, 2)
	r[0] = int32(uintptr(unsafe.Pointer(&(p[0]))))
	r[1] = int32(len(p))
	return &r[0]
}

func StringToPtr64(data string) *int64 {
	p := []byte(data)
	r := make([]int64, 2)
	r[0] = int64(uintptr(unsafe.Pointer(&(p[0]))))
	r[1] = int64(len(p))
	return &r[0]
}

func PtrToFixedString(subject *int32, l int32) string {
	var subjectStr strings.Builder
	pointer := uintptr(unsafe.Pointer(subject))
	for i := 0; i < int(l); i++ {
		s := *(*int32)(unsafe.Pointer(pointer + uintptr(i)))
		subjectStr.WriteByte(byte(s))
	}
	return subjectStr.String()
}

func Run(keyPtr *int32, bodyPtr *int32) *int32 {
	var key = PtrToString(keyPtr)
	var body = PtrToString(bodyPtr)
	output := funcMap[key](body)
	r := make([]int32, 2)
	r[0] = int32(uintptr(unsafe.Pointer(&(output[0]))))
	r[1] = int32(len(output))
	return &r[0]
}

func Sql(a string) string {
	return PtrToString(sql(StringToPtr(a)))
}

func LogData(a string) {
	logData(StringToPtr(a))
}
