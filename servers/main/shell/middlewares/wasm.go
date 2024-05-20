package genesis

import (
	"encoding/binary"
	"encoding/json"
	"fmt"
	"log"
	"os"

	"sigma/main/core/modules"
	"sigma/main/core/utils"

	dtos_external "sigma/main/core/dtos/external"
	outputs_external "sigma/main/shell/outputs/external"

	"github.com/gofiber/fiber/v2"
	"github.com/second-state/WasmEdge-go/wasmedge"
)

const pluginsTemplateName = "/plugins/"

var pluginVms = map[string]*wasmedge.VM{}
var pluginMetas = map[string]modules.PluginFunction{}

func plug(app *modules.App, input dtos_external.PlugDto, assistant modules.Assistant) (any, error) {
	var meta []modules.PluginFunction
	err := json.Unmarshal([]byte(input.Meta), &meta)
	if err != nil {
		return outputs_external.PlugDto{}, err
	}
	assistant.SaveFileToGlobalStorage(app.StorageRoot+pluginsTemplateName+input.Key, input.File, "module.wasm", true)
	assistant.SaveDataToGlobalStorage(app.StorageRoot+pluginsTemplateName+input.Key, []byte(input.Meta), "meta.txt", true)

	wasmedge.SetLogDebugLevel()

	var conf = wasmedge.NewConfigure(wasmedge.REFERENCE_TYPES)
	conf.AddConfig(wasmedge.WASI)
	vm := wasmedge.NewVMWithConfig(conf)
	var wasi = vm.GetImportModule(wasmedge.WASI)
	wasi.InitWasi(
		os.Args[1:],     // The args
		os.Environ(),    // The envs
		[]string{".:."}, // The mapping directories
	)

	obj := wasmedge.NewModule("env")

	funcSqlType := wasmedge.NewFunctionType(
		[]wasmedge.ValType{
			wasmedge.ValType_I32,
		},
		[]wasmedge.ValType{
			wasmedge.ValType_I32,
		})
	h := &vmHost{vm: vm}
	hostSql := wasmedge.NewFunction(funcSqlType, h.sql, nil, 0)
	obj.AddFunction("sql", hostSql)

	funcLogType := wasmedge.NewFunctionType(
		[]wasmedge.ValType{
			wasmedge.ValType_I32,
		},
		[]wasmedge.ValType{})
	hostLog := wasmedge.NewFunction(funcLogType, h.logData, nil, 0)
	obj.AddFunction("logData", hostLog)

	vm.RegisterModule(obj)

	err2 := vm.LoadWasmFile(app.StorageRoot + pluginsTemplateName + input.Key + "/module.wasm")
	if err2 != nil {
		log.Println("failed to load wasm")
	}
	vm.Validate()
	vm.Instantiate()

	vm.Execute("_start")

	for _, f := range meta {
		if pluginVms[f.Path] != nil {
			pluginVms[f.Path].Release()
		}
		pluginVms[f.Path] = vm
		pluginMetas[f.Path] = f
	}

	return outputs_external.PlugDto{}, nil
}

type vmHost struct {
	vm *wasmedge.VM
}

func (h *vmHost) logData(_ interface{}, callframe *wasmedge.CallingFrame, params []interface{}) ([]interface{}, wasmedge.Result) {
	fmt.Println(h.remotePtrToString(params[0].(int32), callframe))
	return []interface{}{}, wasmedge.Result_Success
}

func (h *vmHost) sql(_ interface{}, callframe *wasmedge.CallingFrame, params []interface{}) ([]interface{}, wasmedge.Result) {
	fmt.Println(string(h.remotePtrToString(params[0].(int32), callframe)))
	return []interface{}{interface{}(h.localStringToPtr("response for sql", callframe))}, wasmedge.Result_Success
}

func (h *vmHost) remotePtrToString(pointer int32, callframe *wasmedge.CallingFrame) string {
	mem := callframe.GetMemoryByIndex(0)
	memData, _ := mem.GetData(uint(pointer), 8)
	resultPointer := binary.LittleEndian.Uint32(memData[:4])
	resultLength := binary.LittleEndian.Uint32(memData[4:])
	data, _ := mem.GetData(uint(resultPointer), uint(resultLength))
	url := make([]byte, resultLength)
	copy(url, data)
	return string(url)
}

func (h *vmHost) localStringToPtr(data string, callframe *wasmedge.CallingFrame) int32 {
	mem := callframe.GetMemoryByIndex(0)
	data2 := []byte(data)
	result, _ := h.vm.Execute("malloc", int32(len(data2)+1))
	pointer := result[0].(int32)
	m, _ := mem.GetData(uint(pointer), uint(len(data2)+1))
	copy(m[:len(data2)], data2)
	copy(m[len(data2):], []byte{0})
	return pointer
}

func loadWasmModules(app *modules.App) {
	wasmedge.SetLogErrorLevel()
	files, err := os.ReadDir(app.StorageRoot + "/plugins")
	if err != nil {
		log.Println(err)
	}
	for _, file := range files {
		if file.IsDir() {

			var conf = wasmedge.NewConfigure(wasmedge.REFERENCE_TYPES)
			conf.AddConfig(wasmedge.WASI)
			vm := wasmedge.NewVMWithConfig(conf)
			var wasi = vm.GetImportModule(wasmedge.WASI)
			wasi.InitWasi(
				os.Args[1:],     // The args
				os.Environ(),    // The envs
				[]string{".:."}, // The mapping directories
			)

			obj := wasmedge.NewModule("env")

			funcSqlType := wasmedge.NewFunctionType(
				[]wasmedge.ValType{
					wasmedge.ValType_I32,
				},
				[]wasmedge.ValType{
					wasmedge.ValType_I32,
				})
			h := &vmHost{vm: vm}
			hostSql := wasmedge.NewFunction(funcSqlType, h.sql, nil, 0)
			obj.AddFunction("sql", hostSql)

			funcLogType := wasmedge.NewFunctionType(
				[]wasmedge.ValType{
					wasmedge.ValType_I32,
				},
				[]wasmedge.ValType{})
			hostLog := wasmedge.NewFunction(funcLogType, h.logData, nil, 0)
			obj.AddFunction("logData", hostLog)

			vm.RegisterModule(obj)

			err2 := vm.LoadWasmFile(app.StorageRoot + pluginsTemplateName + file.Name() + "/module.wasm")
			if err2 != nil {
				log.Println("failed to load wasm")
			}
			vm.Validate()
			vm.Instantiate()

			vm.Execute("_start")

			metaJson, err1 := os.ReadFile(app.StorageRoot + pluginsTemplateName + file.Name() + "/meta.txt")
			if err1 != nil {
				log.Println(err1)
				continue
			}

			var meta []modules.PluginFunction
			err3 := json.Unmarshal(metaJson, &meta)
			if err3 != nil {
				log.Println(err3)
				continue
			}

			for _, f := range meta {
				if pluginVms[f.Path] != nil {
					pluginVms[f.Path].Release()
				}
				pluginVms[f.Path] = vm
				pluginMetas[f.Path] = f
			}
		}
	}
}

func CreateExternalService(app *modules.App) func(*fiber.Ctx) error {

	// load vms into memory
	loadWasmModules(app)

	// Methods
	modules.Instance().Services.AddAction(
		modules.CreateAction("/external/plug",
			fiber.MethodPost,
			modules.CreateCk(true, false, false),
			modules.CreateAc(true, true, false, false),
			false,
			plug,
		),
	)

	return func(c *fiber.Ctx) error {
		path := c.Path()
		vm, ok := pluginVms[path]
		if ok {
			meta := pluginMetas[path]
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
				var userId, userType = modules.AuthWithToken(app, token)
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
						var location = modules.HandleLocationWithProcessed(app, token, userId, creature, origin, towerId.(int64), roomId.(int64), workerId.(int64))
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
