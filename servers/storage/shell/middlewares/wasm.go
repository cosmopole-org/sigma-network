package middlewares_wasm

import (
	"encoding/binary"
	"encoding/json"

	"sigma/storage/core/runtime"
	"sigma/storage/core/utils"
	"sigma/storage/shell/managers"

	"github.com/gofiber/fiber/v2"
)

func WasmMiddleware(app *runtime.App, mans *managers.Managers) func(*fiber.Ctx) error {
	return func(c *fiber.Ctx) error {
		path := c.Path()
		vm, ok := mans.WasmManager().PluginVms[path]
		if ok {
			meta := mans.WasmManager().PluginMetas[path]
			var body = ""
			if meta.Access.ActionType == "POST" || meta.Access.ActionType == "PUT" || meta.Access.ActionType == "DELETE" {
				body = string(c.BodyRaw())
			} else if meta.Access.ActionType == "GET" {
				dictStr, _ := json.Marshal(c.AllParams())
				body = string(dictStr)
			}
			var lengthOfSubject = len(body)

			originHeader := c.GetReqHeaders()["Origin"]
			var origin = ""
			if originHeader != nil {
				origin = originHeader[0]
			}
			var token = ""
			tokenHeader := c.GetReqHeaders()["Token"]
			if tokenHeader != nil {
				token = tokenHeader[0]
			}

			var check = meta.Check

			var data = map[string]interface{}{}
			if meta.Access.ActionType == "POST" || meta.Access.ActionType == "PUT" || meta.Access.ActionType == "DELETE" {
				c.BodyParser(&data)
			} else if meta.Access.ActionType == "GET" {
				c.ParamsParser(&data)
			}

			doAction := func() error {
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

				return c.Status(fiber.StatusOK).JSON(output)
			}

			if check.User {
				var userId, userType = app.Managers.SecurityManager().AuthWithToken(token)
				var creature = ""
				if userType == 1 {
					creature = "human"
				} else if userType == 2 {
					creature = "machine"
				}
				if userId > 0 {
					if check.Tower {
						var towerId interface{}
						towerId, tOk := data["towerId"]
						if !tOk {
							towerId = 0
						}
						var roomId interface{}
						roomId, rOk := data["roomId"]
						if !rOk {
							roomId = 0
						}
						var workerId interface{}
						workerId, wOk := data["workerId"]
						if !wOk {
							workerId = 0
						}
						var location = app.Managers.SecurityManager().HandleLocationWithProcessed(token, userId, creature, origin, towerId.(int64), roomId.(int64), workerId.(int64))
						if location.TowerId > 0 {
							return doAction()
						} else {
							return c.Status(fiber.StatusForbidden).JSON(utils.BuildErrorJson("access denied"))
						}
					} else {
						return doAction()
					}
				} else {
					return c.Status(fiber.StatusForbidden).JSON(utils.BuildErrorJson("access denied"))
				}
			} else {
				return doAction()
			}
		}
		return c.Next()
	}
}
