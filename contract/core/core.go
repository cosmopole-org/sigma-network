package core

import (
	"encoding/json"
	"fmt"
	"strings"
	"unsafe"
)

//go:module env
//export message
func message(a *int32) *int32

//go:module env
//export logData
func logData(a *int32)

//export run
func run(keyLength int32, keyPtr *int32, bodyLength int32, bodyPtr *int32) *int32 {
	return Run(keyLength, keyPtr, bodyLength, bodyPtr)
}

var funcMap = map[string]func(input string) []byte{}
var funcFrame = map[string]interface{}{}

func AddMethod[T any, V any](key string, handler func(input T) V) {
	funcMap[key] = func(input string) []byte {
		fmt.Println("input: ", input)
		var frame T
		json.Unmarshal([]byte(input), &frame)
		result := handler(frame)
		fmt.Println("result: ", result)
		output, _ := json.Marshal(result)
		return output
	}
	funcFrame[key] = *new(T)
}

func PtrToString(subject *int32) string {
	nth := 0
	var subjectStr = &strings.Builder{}
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

func Run(keyLength int32, keyPtr *int32, bodyLength int32, bodyPtr *int32) *int32 {

	fmt.Println("inputting...")

	var subjectStrKey = &strings.Builder{}
	pointerKey := uintptr(unsafe.Pointer(keyPtr))
	for i := 0; i < int(keyLength); i++ {
		s := *(*int32)(unsafe.Pointer(pointerKey + uintptr(i)))
		subjectStrKey.WriteByte(byte(s))
	}
	var key = subjectStrKey.String()

	var subjectStr = &strings.Builder{}
	pointer := uintptr(unsafe.Pointer(bodyPtr))
	for i := 0; i < int(bodyLength); i++ {
		s := *(*int32)(unsafe.Pointer(pointer + uintptr(i)))
		subjectStr.WriteByte(byte(s))
	}
	var body = subjectStr.String()

	LogData(key)
	LogData(body)

	fn, ok := funcMap[key]
	var output []byte

	if !ok {
		output = []byte(`{ "error": "endpoint not found" }`)
	} else {
		output = fn(body)
	}

	r := make([]int32, 2)
	r[0] = int32(uintptr(unsafe.Pointer(&(output[0]))))
	r[1] = int32(len(output))
	return &r[0]
}

func Message(a string) {
	message(StringToPtr(a))
}

func LogData(a string) {
	logData(StringToPtr(a))
}
