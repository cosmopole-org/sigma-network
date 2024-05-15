package services

import (
	"encoding/binary"
	"encoding/json"
	"log"
	"os"
	"sigma/main/core/modules"
	"sigma/main/core/utils"

	dtos_external "sigma/main/shell/dtos/external"
	outputs_external "sigma/main/shell/outputs/external"
	service_manager "sigma/main/shell/services/manager"

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

	wasmedge.SetLogErrorLevel()
	conf := wasmedge.NewConfigure(wasmedge.WASI)
	vm := wasmedge.NewVMWithConfig(conf)
	wasi := vm.GetImportModule(wasmedge.WASI)
	wasi.InitWasi(
		os.Args[1:],
		os.Environ(),
		[]string{".:."},
	)
	err2 := vm.LoadWasmFile(app.StorageRoot + pluginsTemplateName + input.Key + "/module.wasm")
	if err2 != nil {
		log.Println("failed to load wasm")
	}
	vm.Validate()
	vm.Instantiate()

	vm.Execute("build")

	for _, f := range meta {
		if pluginVms[f.Path] != nil {
			pluginVms[f.Path].Release()
		}
		pluginVms[f.Path] = vm
		pluginMetas[f.Path] = f
	}

	return outputs_external.PlugDto{}, nil
}

func loadWasmModules(app *modules.App) {
	wasmedge.SetLogErrorLevel()
	files, err := os.ReadDir(app.StorageRoot + "/plugins")
	if err != nil {
		log.Println(err)
	}
	for _, file := range files {
		if file.IsDir() {
			conf := wasmedge.NewConfigure(wasmedge.WASI)
			vm := wasmedge.NewVMWithConfig(conf)
			wasi := vm.GetImportModule(wasmedge.WASI)
			wasi.InitWasi(
				os.Args[1:],
				os.Environ(),
				[]string{".:."},
			)
			err2 := vm.LoadWasmFile(app.StorageRoot + pluginsTemplateName + file.Name() + "/module.wasm")
			if err2 != nil {
				log.Println("failed to load wasm")
			}
			vm.Validate()
			vm.Instantiate()
			vm.Execute("build")

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
				pluginVms[f.Path] = vm
				pluginMetas[f.Path] = f
			}
		}
	}
}

func CreateExternalService(app *modules.App) {

	// load vms into memory
	loadWasmModules(app)

	//Middleware for plugins
	app.Network.HttpServer.Server.Use(func(c *fiber.Ctx) error {
		path := c.Path()
		vm, ok := pluginVms[path]
		if !ok {
			return c.Next()
		}

		meta := pluginMetas[path]
		var body = ""
		if meta.Mo.RestAction == "POST" || meta.Mo.RestAction == "PUT" || meta.Mo.RestAction == "DELETE" {
			body = string(c.BodyRaw())
		} else if meta.Mo.RestAction == "GET" {
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
		// var requestId = ""
		// requestIdHeader := c.GetReqHeaders()["RequestId"]
		// if requestIdHeader != nil {
		// 	requestId = requestIdHeader[0]
		// }

		var check = meta.Ch

		var data = map[string]interface{}{}
		if meta.Mo.RestAction == "POST" || meta.Mo.RestAction == "PUT" || meta.Mo.RestAction == "DELETE" {
			c.BodyParser(&data)
		} else if meta.Mo.RestAction == "GET" {
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
	})

	// Methods
	service_manager.AddEndpoint(
		modules.CreateNonValidateMethod[dtos_external.PlugDto, dtos_external.PlugDto](
			"/external/plug",
			plug,
			dtos_external.PlugDto{},
			modules.CreateCheck(true, false, false),
			modules.CreateMethodOptions(true, fiber.MethodPost, true, false),
			modules.CreateInterFedOptions(true, true),
		),
	)
}
