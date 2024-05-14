package services

import (
	"encoding/binary"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"sigma/main/core/modules"
	"unsafe"

	dtos_external "sigma/main/shell/dtos/external"
	outputs_external "sigma/main/shell/outputs/external"

	"github.com/gofiber/fiber/v2"
	"github.com/second-state/WasmEdge-go/wasmedge"
)

var pluginVms = map[string]*wasmedge.VM{}
var pluginMetas = map[string]modules.PluginFunction{}

func plug(app *modules.App, input dtos_external.PlugDto, assistant modules.Assistant) (any, error) {
	var meta []modules.PluginFunction
	err := json.Unmarshal([]byte(input.Meta), &meta)
	if err != nil {
		return outputs_external.PlugDto{}, err
	}
	assistant.SaveFileToGlobalStorage(app.StorageRoot+"/plugins/"+input.Key, input.File, "module.wasm")
	assistant.SaveDataToGlobalStorage(app.StorageRoot+"/plugins/"+input.Key, []byte(input.Meta), "meta.txt")

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

	pluginVms[meta[0].Path] = vm
	pluginMetas[meta[0].Path] = meta[0]

	// for index, f := range meta {
	// 	fn, err := instance.Exports.GetFunction(f.Key)
	// 	if err != nil {
	// 		log.Println(err)
	// 		continue
	// 	}
	// 	plugins[f.Path] = fn
	// 	pluginInsts[f.Path] = instance
	// 	pluginMetas[f.Path] = meta[index]
	// 	modules.AddMethod(
	// 		app,
	// 		modules.CreateRawMethod[modules.IDto, modules.IDto](
	// 			f.Path,
	// 			nil,
	// 			nil,
	// 			f.Ch,
	// 			f.Mo,
	// 			modules.CreateInterFedOptions(true, true),
	// 		))
	// }
	return outputs_external.PlugDto{}, nil
}

func stringToPtr(s string) (uint32, uint32) {
	buf := []byte(s)
	ptr := &buf[0]
	unsafePtr := uintptr(unsafe.Pointer(ptr))
	return uint32(unsafePtr), uint32(len(buf))
}

func CreateExternalService(app *modules.App) {

	//Middleware for plugins
	app.Network.HttpServer.Server.Use(func(c *fiber.Ctx) error {
		path := c.Path()
		vm := pluginVms[path]
		if vm == nil {
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

		allocateResult, _ := vm.Execute("malloc", int32(lengthOfSubject+1))
		inputPointer := allocateResult[0].(int32)

		// Write the subject into the memory.
		mod := vm.GetActiveModule()
		mem := mod.FindMemory("memory")
		memData, _ := mem.GetData(uint(inputPointer), uint(lengthOfSubject+1))
		copy(memData, body)

		// C-string terminates by NULL.
		memData[lengthOfSubject] = 0

		// Run the `greet` function. Given the pointer to the subject.
		greetResult, _ := vm.Execute(meta.Key, inputPointer)
		outputPointer := greetResult[0].(int32)

		memData, _ = mem.GetData(uint(outputPointer), 8)
		resultPointer := binary.LittleEndian.Uint32(memData[:4])
		resultLength := binary.LittleEndian.Uint32(memData[4:])

		// Read the result of the `greet` function.
		memData, _ = mem.GetData(uint(resultPointer), uint(resultLength))
		fmt.Println(string(memData))

		// Deallocate the subject, and the output.
		vm.Execute("free", inputPointer)

		return c.Status(fiber.StatusOK).JSON(string(memData))
	})

	// Methods
	modules.AddMethod(
		app,
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
