package core

import (
	"encoding/json"
	"strings"
	"unsafe"
)

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

func ptrToString(subject *int32) string {
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

func Run(keyPtr *int32, bodyPtr *int32) *int32 {
	var key = ptrToString(keyPtr)
	var body = ptrToString(bodyPtr)
	output := funcMap[key](body)
	r := make([]int32, 2)
	r[0] = int32(uintptr(unsafe.Pointer(&(output[0]))))
	r[1] = int32(len(output))
	return &r[0]
}
