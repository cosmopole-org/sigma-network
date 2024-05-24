package wasm_manager

import (
	"encoding/binary"
	"encoding/json"
	"os"

	"sigma/storage/core/runtime"
	"sigma/storage/core/utils"

	"github.com/second-state/WasmEdge-go/wasmedge"
)

type WasmManager struct {
	PluginVms   map[string]*wasmedge.VM
	PluginMetas map[string]runtime.PluginFunction
}

const pluginsTemplateName = "/plugins/"

func (wm *WasmManager) Plug(wasmFilePath string, meta []runtime.PluginFunction) {

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

	err2 := vm.LoadWasmFile(wasmFilePath)
	if err2 != nil {
		utils.Log(5, "failed to load wasm")
	}
	vm.Validate()
	vm.Instantiate()

	vm.Execute("_start")

	for _, f := range meta {
		if wm.PluginVms[f.Path] != nil {
			wm.PluginVms[f.Path].Release()
		}
		wm.PluginVms[f.Path] = vm
		wm.PluginMetas[f.Path] = f
	}
}

type vmHost struct {
	vm *wasmedge.VM
}

func (h *vmHost) logData(_ interface{}, callframe *wasmedge.CallingFrame, params []interface{}) ([]interface{}, wasmedge.Result) {
	utils.Log(5, h.remotePtrToString(params[0].(int32), callframe))
	return []interface{}{}, wasmedge.Result_Success
}

func (h *vmHost) sql(_ interface{}, callframe *wasmedge.CallingFrame, params []interface{}) ([]interface{}, wasmedge.Result) {
	utils.Log(5, string(h.remotePtrToString(params[0].(int32), callframe)))
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

func (wm *WasmManager) LoadWasmModules(app *runtime.App) {
	wasmedge.SetLogErrorLevel()
	err0 := os.MkdirAll(app.StorageRoot+"/plugins", os.ModePerm)
	if err0 != nil {
		utils.Log(5, err0)
	}
	files, err := os.ReadDir(app.StorageRoot + "/plugins")
	if err != nil {
		utils.Log(5, err)
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
				utils.Log(5, "failed to load wasm")
			}
			vm.Validate()
			vm.Instantiate()

			vm.Execute("_start")

			metaJson, err1 := os.ReadFile(app.StorageRoot + pluginsTemplateName + file.Name() + "/meta.txt")
			if err1 != nil {
				utils.Log(5, err1)
				continue
			}

			var meta []runtime.PluginFunction
			err3 := json.Unmarshal(metaJson, &meta)
			if err3 != nil {
				utils.Log(5, err3)
				continue
			}

			for _, f := range meta {
				if wm.PluginVms[f.Path] != nil {
					wm.PluginVms[f.Path].Release()
				}
				wm.PluginVms[f.Path] = vm
				wm.PluginMetas[f.Path] = f
			}
		}
	}
}

func New(sc *runtime.App) *WasmManager {
	wm := &WasmManager{
		PluginVms:   make(map[string]*wasmedge.VM),
		PluginMetas: make(map[string]runtime.PluginFunction),
	}
	wm.LoadWasmModules(sc)
	return wm
}
