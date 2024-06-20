package middlewares_wasm

import (
	"encoding/binary"
	"encoding/json"
	"errors"

	"sigma/admin/shell/tools"

	"github.com/gofiber/fiber/v2"
)

func WasmMiddleware(toolbox *tools.Toolbox) func(key string, packetId string, input interface{}, token string, origin string) (int, any, error) {
	return func(key string, packetId string, rawInput interface{}, token string, origin string) (int, any, error) {
		path := key
		vm, ok := toolbox.Wasm().PluginVms[path]
		if ok {
			meta := toolbox.Wasm().PluginMetas[path]
			var body = ""
			switch input := rawInput.(type) {
			case string:
				body = input
			case *fiber.Ctx:
				if meta.Access.ActionType == "POST" || meta.Access.ActionType == "PUT" || meta.Access.ActionType == "DELETE" {
					body = string(input.BodyRaw())
				} else if meta.Access.ActionType == "GET" {
					dictStr, _ := json.Marshal(input.AllParams())
					body = string(dictStr)
				}
			default:
				//pass
			}

			var lengthOfSubject = len(body)

			var check = meta.Check

			doAction := func() (int, any, error) {
				var key = meta.Key
				var lengthOfKey = len(meta.Key)

				keyAllocateResult, _ := vm.Execute("malloc", int32(lengthOfKey+1))
				keyiInputPointer := keyAllocateResult[0].(int32)

				allocateResult, _ := vm.Execute("malloc", int32(lengthOfSubject+1))
				inputPointer := allocateResult[0].(int32)

				// Write the subject into the memory.
				mod := vm.GetActiveModule()
				mem := mod.FindMemory("memory")
				keyMemData, _ := mem.GetData(uint(keyiInputPointer), uint(lengthOfKey+1))
				copy(keyMemData, key)
				memData, _ := mem.GetData(uint(inputPointer), uint(lengthOfSubject+1))
				copy(memData, body)

				// C-string terminates by NULL.
				keyMemData[lengthOfKey] = 0
				memData[lengthOfSubject] = 0

				// Run the `greet` function. Given the pointer to the subject.
				greetResult, _ := vm.Execute("run", keyiInputPointer, inputPointer)
				outputPointer := greetResult[0].(int32)

				memData, _ = mem.GetData(uint(outputPointer), 8)
				resultPointer := binary.LittleEndian.Uint32(memData[:4])
				resultLength := binary.LittleEndian.Uint32(memData[4:])

				// Read the result of the `greet` function.
				memData, _ = mem.GetData(uint(resultPointer), uint(resultLength))

				// Deallocate the subject, and the output.
				vm.Execute("free", inputPointer)

				var output map[string]interface{}
				json.Unmarshal(memData, &output)

				return fiber.StatusOK, output, nil
			}

			if check.User {
				var userId, userType = toolbox.Security().AuthWithToken(token)
				if userId != "" {
					if check.Space {
						var inputMap map[string]string
						json.Unmarshal([]byte(body), inputMap)
						var spaceId interface{}
						sId, tOk := inputMap["spaceId"]
						if !tOk {
							spaceId = ""
						} else {
							spaceId = sId
						}
						var topicId interface{}
						tId, rOk := inputMap["topicId"]
						if !rOk {
							topicId = ""
						} else {
							topicId = tId
						}
						var memberId interface{}
						mId, wOk := inputMap["memberId"]
						if !wOk {
							memberId = ""
						} else {
							memberId = mId
						}
						var location = toolbox.Security().HandleLocationWithProcessed(token, userId, userType, spaceId.(string), topicId.(string), memberId.(string))
						if location.SpaceId != "" {
							return doAction()
						} else {
							return fiber.StatusForbidden, nil, errors.New("access denied")
						}
					} else {
						return doAction()
					}
				} else {
					return fiber.StatusForbidden, nil, errors.New("access denied")
				}
			} else {
				return doAction()
			}
		}
		return -3, nil, nil
	}
}
