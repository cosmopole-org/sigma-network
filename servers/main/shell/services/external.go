package services

import (
	"encoding/binary"
	"encoding/json"
	"log"
	"os"
	"sigma/main/core/modules"

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
	err2 := vm.LoadWasmFile(app.StorageRoot + "/plugins/" + input.Key + "/module.wasm")
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

func CreateExternalService(app *modules.App) {

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
