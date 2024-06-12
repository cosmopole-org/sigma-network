package wasm

import (
	"encoding/binary"
	"encoding/json"
	"github.com/second-state/WasmEdge-go/wasmedge"
	"os"
	"sigma/sigma/abstract"
	moduleactormodel "sigma/sigma/core/module/actor/model"
	modulelogger "sigma/sigma/core/module/logger"
	"sigma/sigma/layer1/module/actor"
	"sigma/sigma/layer2/tools/wasm/model"
)

type Wasm struct {
	sigmaCore   abstract.ICore
	logger      *modulelogger.Logger
	storageRoot string
	PluginVms   map[string]*wasmedge.VM
	PluginMetas map[string]abstract.IAction
}

type PluginMeta struct {
	Key   string       `json:"key" validate:"required"`
	Path  string       `json:"path" validate:"required"`
	Guard *actor.Guard `json:"guard" validate:"required"`
}

const pluginsTemplateName = "/plugins/"

func (wm *Wasm) prepareVm(wasmFilePath string) (*wasmedge.VM, error) {
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
	h := &vmHost{vm: vm, wasmTool: wm}
	hostSql := wasmedge.NewFunction(funcSqlType, h.sql, nil, 0)
	obj.AddFunction("sql", hostSql)

	funcLogType := wasmedge.NewFunctionType(
		[]wasmedge.ValType{
			wasmedge.ValType_I32,
		},
		[]wasmedge.ValType{})
	hostLog := wasmedge.NewFunction(funcLogType, h.logData, nil, 0)
	obj.AddFunction("logData", hostLog)

	err5 := vm.RegisterModule(obj)
	if err5 != nil {
		wm.logger.Println("failed to register wasm")
		return nil, err5
	}
	err4 := vm.LoadWasmFile(wasmFilePath)
	if err4 != nil {
		wm.logger.Println("failed to load wasm")
		return nil, err4
	}
	err3 := vm.Validate()
	if err3 != nil {
		wm.logger.Println("failed to validate wasm")
		return nil, err3
	}
	err2 := vm.Instantiate()
	if err2 != nil {
		wm.logger.Println("failed to instantiate wasm")
		return nil, err2
	}
	_, err1 := vm.Execute("_start")
	if err1 != nil {
		wm.logger.Println(err1)
		return nil, err1
	}
	return vm, nil
}

func (wm *Wasm) injectModule(vm *wasmedge.VM, f PluginMeta) {
	action := moduleactormodel.NewAction(f.Path, func(state abstract.IState, input abstract.IInput) (any, error) {
		var body = input.(model.WasmInput).Data
		var lengthOfSubject = len(body)
		key := f.Key
		var lengthOfKey = len(key)

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
		_, err2 := vm.Execute("free", inputPointer)
		if err2 != nil {
			wm.logger.Println(err2)
			return nil, err2
		}

		var output map[string]interface{}
		err := json.Unmarshal(memData, &output)
		if err != nil {
			wm.logger.Println(err)
			return nil, err
		}

		return output, nil
	})
	secureAction := actor.NewSecureAction(action, f.Guard, wm.sigmaCore, wm.logger, map[string]actor.Parse{
		"*": func(i interface{}) (abstract.IInput, error) {
			return model.WasmInput{Data: i.(string)}, nil
		},
	})
	wm.PluginMetas[f.Path] = secureAction
	wm.sigmaCore.Get(1).Actor().InjectAction(secureAction)
}

func (wm *Wasm) Plug(wasmFilePath string, meta []PluginMeta) {

	wasmedge.SetLogDebugLevel()

	vm, err := wm.prepareVm(wasmFilePath)
	if err != nil {
		wm.logger.Println(err)
		return
	}

	for _, f := range meta {
		if wm.PluginVms[f.Path] != nil {
			wm.PluginVms[f.Path].Release()
		}
		wm.PluginVms[f.Path] = vm
		wm.injectModule(vm, f)
	}
}

type vmHost struct {
	wasmTool *Wasm
	vm       *wasmedge.VM
}

func (h *vmHost) logData(_ interface{}, callframe *wasmedge.CallingFrame, params []interface{}) ([]interface{}, wasmedge.Result) {
	h.wasmTool.logger.Println(h.remotePtrToString(params[0].(int32), callframe))
	return []interface{}{}, wasmedge.Result_Success
}

func (h *vmHost) sql(_ interface{}, callframe *wasmedge.CallingFrame, params []interface{}) ([]interface{}, wasmedge.Result) {
	h.wasmTool.logger.Println(string(h.remotePtrToString(params[0].(int32), callframe)))
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

func (wm *Wasm) loadWasmModules() {
	err0 := os.MkdirAll(wm.storageRoot+"/plugins", os.ModePerm)
	if err0 != nil {
		wm.logger.Println(err0)
	}
	files, err := os.ReadDir(wm.storageRoot + "/plugins")
	if err != nil {
		wm.logger.Println(err)
	}
	for _, file := range files {
		if file.IsDir() {
			vm, err := wm.prepareVm(wm.storageRoot + pluginsTemplateName + file.Name() + "/module.wasm")
			if err != nil {
				wm.logger.Println(err)
				continue
			}
			metaJson, err1 := os.ReadFile(wm.storageRoot + pluginsTemplateName + file.Name() + "/meta.txt")
			if err1 != nil {
				wm.logger.Println(err1)
				continue
			}
			var meta []PluginMeta
			err3 := json.Unmarshal(metaJson, &meta)
			if err3 != nil {
				wm.logger.Println(err3)
				continue
			}
			for _, f := range meta {
				if wm.PluginVms[f.Path] != nil {
					wm.PluginVms[f.Path].Release()
				}
				wm.PluginVms[f.Path] = vm
				wm.injectModule(vm, f)
			}
		}
	}
}

func NewWasm(core abstract.ICore, logger *modulelogger.Logger, storageRoot string) *Wasm {
	wm := &Wasm{
		sigmaCore:   core,
		logger:      logger,
		storageRoot: storageRoot,
		PluginVms:   make(map[string]*wasmedge.VM),
		PluginMetas: make(map[string]abstract.IAction),
	}
	wasmedge.SetLogDebugLevel()
	wm.loadWasmModules()
	return wm
}
