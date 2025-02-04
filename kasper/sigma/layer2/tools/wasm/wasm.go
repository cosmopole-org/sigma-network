package wasm

import (
	"encoding/binary"
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"os"
	"sigma/sigma/abstract"
	moduleactormodel "sigma/sigma/core/module/actor/model"
	modulelogger "sigma/sigma/core/module/logger"
	"sigma/sigma/layer1/adapters"
	adapters_model "sigma/sigma/layer1/adapters/model"
	module_model "sigma/sigma/layer1/model"
	"sigma/sigma/layer1/module/actor"
	statel1 "sigma/sigma/layer1/module/state"
	toolboxL1 "sigma/sigma/layer1/module/toolbox"
	"sigma/sigma/layer2/tools/wasm/model"
	inputs_topics "sigma/sigverse/inputs/topics"
	"strconv"
	"strings"
	"time"

	"github.com/second-state/WasmEdge-go/wasmedge"
)

type Wasm struct {
	sigmaCore      abstract.ICore
	logger         *modulelogger.Logger
	storageRoot    string
	storage        adapters.IStorage
	PluginVms      map[string]*wasmedge.VM
	PluginVmsByKey map[string]*wasmedge.VM
	PluginMetas    map[string]abstract.IAction
}

type PluginMeta struct {
	Key   string       `json:"key" validate:"required"`
	Path  string       `json:"path" validate:"required"`
	Guard *actor.Guard `json:"guard" validate:"required"`
}

const pluginsTemplateName = "/plugins/"

func (wm *Wasm) prepareVm(wasmFilePath string, key string) (*wasmedge.VM, error) {
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
	h := &vmHost{vm: vm, wasmTool: wm, key: key}
	hostSql := wasmedge.NewFunction(funcSqlType, h.message, nil, 0)
	obj.AddFunction("message", hostSql)

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

func (wm *Wasm) injectModule(vm *wasmedge.VM, vmKey string, f PluginMeta) {
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
		greetResult, _ := vm.Execute("run", int32(lengthOfKey), keyiInputPointer, int32(lengthOfSubject), inputPointer)
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
	oldVm, ok := wm.PluginVmsByKey[vmKey]
	if ok {
		oldVm.Release()
	}
	wm.PluginVmsByKey[vmKey] = vm
	wm.sigmaCore.Get(1).Actor().InjectAction(secureAction)
}

type Tag struct {
	Type string
	Val  string
}

var tags = map[string]*Tag{}

func deallocteVals(vm *wasmedge.VM, pointer any) {
	// _, err2 := vm.Execute("free", pointer)
	// if err2 != nil {
	// 	log.Println(err2)
	// }
}

func (wm *Wasm) PrepareNewAgent(vmId string, topicId string, memberId string, userId string) {
	key := topicId + "_" + memberId
	wm.Plug(wm.storageRoot+pluginsTemplateName+vmId+"/module.wasm", key, []PluginMeta{})
	wm.Assign(key, "machine", "b_"+memberId+"_"+userId)
}

func (wm *Wasm) Assign(vmKey string, typ string, tag string) {
	toolbox := abstract.UseToolbox[toolboxL1.IToolboxL1](wm.sigmaCore.Get(1).Tools())

	if len(tag) > 2 && tag[0:2] == "b_" {
		tags[vmKey] = &Tag{Type: typ, Val: strings.Split(tag, "_")[2]}
	} else {
		tags[vmKey] = &Tag{Type: typ, Val: tag}
	}

	if typ == "machine" {
		toolbox.Signaler().ListenToSingle(&module_model.Listener{
			Id: tag,
			Signal: func(a any) {

				vm, ok := wm.PluginVmsByKey[vmKey]
				if !ok {
					log.Println("vm not found")
					return
				}
				str, ok := a.([]byte)
				var body string
				var key string
				if ok {
					parts := strings.Split(string(str), " ")
					key = parts[1]
					body = string(str)[len(parts[0])+1+len(parts[1])+1:]
				} else {
					str, errSerialize := json.Marshal(a)
					if errSerialize != nil {
						log.Println(errSerialize)
						return
					}
					body = string(str)
				}

				var lengthOfSubject = len(body)
				var lengthOfKey = len(key)

				if lengthOfKey == 0 || lengthOfSubject == 0 {
					log.Println("body or key can not be empty")
					return
				}

				keyAllocateResult, allocErr1 := vm.Execute("malloc", int32(lengthOfKey+1))
				if allocErr1 != nil {
					log.Println(allocErr1)
					return
				}
				keyiInputPointer := keyAllocateResult[0].(int32)
				allocateResult, allocErr2 := vm.Execute("malloc", int32(lengthOfSubject+1))
				if allocErr2 != nil {
					log.Println(allocErr2)
					return
				}
				inputPointer := allocateResult[0].(int32)

				// Write the subject into the memory.
				mod := vm.GetActiveModule()
				mem := mod.FindMemory("memory")
				keyMemData, getDataErr1 := mem.GetData(uint(keyiInputPointer), uint(lengthOfKey+1))
				if getDataErr1 != nil {
					log.Println(getDataErr1)
					return
				}
				copy(keyMemData, key)
				memData, getDataErr2 := mem.GetData(uint(inputPointer), uint(lengthOfSubject+1))
				if getDataErr2 != nil {
					log.Println(getDataErr2)
					return
				}
				copy(memData, body)

				// C-string terminates by NULL.
				keyMemData[lengthOfKey] = 0
				memData[lengthOfSubject] = 0

				// Run the `greet` function. Given the pointer to the subject.
				greetResult, runErr := vm.Execute("run", int32(lengthOfKey), keyiInputPointer, int32(lengthOfSubject), inputPointer)
				if runErr != nil {
					log.Println(runErr)

					deallocteVals(vm, inputPointer)
					return
				}
				if len(greetResult) == 0 {
					log.Println("output is empty")

					deallocteVals(vm, inputPointer)
					return
				}
				outputPointer := greetResult[0].(int32)

				getDataErr2 = nil
				memData, getDataErr2 = mem.GetData(uint(outputPointer), 8)
				if getDataErr2 != nil {
					log.Println(getDataErr2)

					deallocteVals(vm, inputPointer)

					return
				}
				resultPointer := binary.LittleEndian.Uint32(memData[:4])
				resultLength := binary.LittleEndian.Uint32(memData[4:])

				// Read the result of the `greet` function.
				getDataErr2 = nil
				memData, getDataErr2 = mem.GetData(uint(resultPointer), uint(resultLength))
				if getDataErr2 != nil {
					log.Println(getDataErr2)

					deallocteVals(vm, inputPointer)

					return
				}

				deallocteVals(vm, inputPointer)

				var output map[string]interface{}
				err := json.Unmarshal(memData, &output)
				if err != nil {
					wm.logger.Println(err)
					return
				}
			},
		})
	}
}

func (wm *Wasm) Plug(wasmFilePath string, key string, meta []PluginMeta) {

	vm, err := wm.prepareVm(wasmFilePath, key)
	if err != nil {
		wm.logger.Println(err)
		return
	}

	if len(meta) == 0 {
		oldVm, ok := wm.PluginVmsByKey[key]
		if ok {
			oldVm.Release()
		}
		wm.PluginVmsByKey[key] = vm
	} else {
		for _, f := range meta {
			if wm.PluginVms[f.Path] != nil {
				wm.PluginVms[f.Path].Release()
			}
			wm.PluginVms[f.Path] = vm
			wm.injectModule(vm, key, f)
		}
	}
}

type vmHost struct {
	key      string
	wasmTool *Wasm
	vm       *wasmedge.VM
}

func (h *vmHost) logData(_ interface{}, callframe *wasmedge.CallingFrame, params []interface{}) ([]interface{}, wasmedge.Result) {
	h.wasmTool.logger.Println(h.remotePtrToString(params[0].(int32), callframe))
	return []interface{}{}, wasmedge.Result_Success
}

type WasmPacket struct {
	host *vmHost
	data map[string]any
}

var wasmPipe = make(chan WasmPacket)

func (h *Wasm) HandleWasmRequest() {

	for {
		var wp = <-wasmPipe

		packet := wp.data
		h := wp.host

		time.Sleep(time.Duration(1) * time.Second)

		switch packet["key"].(string) {
		case "math/genRandGroup":
			{
				callbackId := packet["callbackId"].(string)
				max := packet["max"].(string)
				maxNum, err := strconv.ParseInt(max, 10, 64)
				if err != nil {
					log.Println(err)
					break
				}
				rndArr := []string{}
				for i := 0; i < int(maxNum); i++ {
					rndArr = append(rndArr, fmt.Sprintf("%d", rand.Intn(int(maxNum))))
				}

				go func() {

					time.Sleep(time.Duration(1000) * time.Millisecond)

					var body string
					var key = "response/math/genRandGroup"

					str, errSerialize := json.Marshal(map[string]any{
						"numbers":    rndArr,
						"callbackId": callbackId,
					})
					if errSerialize != nil {
						log.Println(errSerialize)
						return
					}
					body = string(str)

					var lengthOfSubject = len(body)
					var lengthOfKey = len(key)

					if lengthOfKey == 0 || lengthOfSubject == 0 {
						log.Println("body or key can not be empty")
						return
					}

					vm := h.vm

					keyAllocateResult, allocErr1 := vm.Execute("malloc", int32(lengthOfKey+1))
					if allocErr1 != nil {
						log.Println(allocErr1)
						return
					}
					keyiInputPointer := keyAllocateResult[0].(int32)
					allocateResult, allocErr2 := vm.Execute("malloc", int32(lengthOfSubject+1))
					if allocErr2 != nil {
						log.Println(allocErr2)
						return
					}
					inputPointer := allocateResult[0].(int32)

					// Write the subject into the memory.
					mod := vm.GetActiveModule()
					mem := mod.FindMemory("memory")
					keyMemData, getDataErr1 := mem.GetData(uint(keyiInputPointer), uint(lengthOfKey+1))
					if getDataErr1 != nil {
						log.Println(getDataErr1)
						return
					}
					copy(keyMemData, key)
					memData, getDataErr2 := mem.GetData(uint(inputPointer), uint(lengthOfSubject+1))
					if getDataErr2 != nil {
						log.Println(getDataErr2)
						return
					}
					copy(memData, body)

					// C-string terminates by NULL.
					keyMemData[lengthOfKey] = 0
					memData[lengthOfSubject] = 0

					// Run the `greet` function. Given the pointer to the subject.
					greetResult, runErr := vm.Execute("run", int32(lengthOfKey), keyiInputPointer, int32(lengthOfSubject), inputPointer)
					if runErr != nil {
						log.Println(runErr)

						deallocteVals(vm, inputPointer)
						return
					}
					if len(greetResult) == 0 {
						log.Println("output is empty")

						deallocteVals(vm, inputPointer)
						return
					}
					outputPointer := greetResult[0].(int32)

					getDataErr2 = nil
					memData, getDataErr2 = mem.GetData(uint(outputPointer), 8)
					if getDataErr2 != nil {
						log.Println(getDataErr2)

						deallocteVals(vm, inputPointer)

						return
					}
					resultPointer := binary.LittleEndian.Uint32(memData[:4])
					resultLength := binary.LittleEndian.Uint32(memData[4:])

					// Read the result of the `greet` function.
					getDataErr2 = nil
					memData, getDataErr2 = mem.GetData(uint(resultPointer), uint(resultLength))
					if getDataErr2 != nil {
						log.Println(getDataErr2)

						deallocteVals(vm, inputPointer)

						return
					}

					deallocteVals(vm, inputPointer)

					var output map[string]interface{}
					err := json.Unmarshal(memData, &output)
					if err != nil {
						log.Println(err)
						return
					}
				}()

				break
			}
		case "math/genRand":
			{
				callbackId := packet["callbackId"].(string)
				max := packet["max"].(string)
				maxNum, err := strconv.ParseInt(max, 10, 64)
				if err != nil {
					log.Println(err)
					break
				}
				rnd := fmt.Sprintf("%d", rand.Intn(int(maxNum)))

				go func() {

					time.Sleep(time.Duration(250) * time.Millisecond)

					var body string
					var key = "response/math/genRand"

					str, errSerialize := json.Marshal(map[string]any{
						"number":     rnd,
						"callbackId": callbackId,
					})
					if errSerialize != nil {
						log.Println(errSerialize)
						return
					}
					body = string(str)

					var lengthOfSubject = len(body)
					var lengthOfKey = len(key)

					if lengthOfKey == 0 || lengthOfSubject == 0 {
						log.Println("body or key can not be empty")
						return
					}

					vm := h.vm

					keyAllocateResult, allocErr1 := vm.Execute("malloc", int32(lengthOfKey+1))
					if allocErr1 != nil {
						log.Println(allocErr1)
						return
					}
					keyiInputPointer := keyAllocateResult[0].(int32)
					allocateResult, allocErr2 := vm.Execute("malloc", int32(lengthOfSubject+1))
					if allocErr2 != nil {
						log.Println(allocErr2)
						return
					}
					inputPointer := allocateResult[0].(int32)

					// Write the subject into the memory.
					mod := vm.GetActiveModule()
					mem := mod.FindMemory("memory")
					keyMemData, getDataErr1 := mem.GetData(uint(keyiInputPointer), uint(lengthOfKey+1))
					if getDataErr1 != nil {
						log.Println(getDataErr1)
						return
					}
					copy(keyMemData, key)
					memData, getDataErr2 := mem.GetData(uint(inputPointer), uint(lengthOfSubject+1))
					if getDataErr2 != nil {
						log.Println(getDataErr2)
						return
					}
					copy(memData, body)

					// C-string terminates by NULL.
					keyMemData[lengthOfKey] = 0
					memData[lengthOfSubject] = 0

					// Run the `greet` function. Given the pointer to the subject.
					greetResult, runErr := vm.Execute("run", int32(lengthOfKey), keyiInputPointer, int32(lengthOfSubject), inputPointer)
					if runErr != nil {
						log.Println(runErr)

						deallocteVals(vm, inputPointer)
						return
					}
					if len(greetResult) == 0 {
						log.Println("output is empty")

						deallocteVals(vm, inputPointer)
						return
					}
					outputPointer := greetResult[0].(int32)

					getDataErr2 = nil
					memData, getDataErr2 = mem.GetData(uint(outputPointer), 8)
					if getDataErr2 != nil {
						log.Println(getDataErr2)

						deallocteVals(vm, inputPointer)

						return
					}
					resultPointer := binary.LittleEndian.Uint32(memData[:4])
					resultLength := binary.LittleEndian.Uint32(memData[4:])

					// Read the result of the `greet` function.
					getDataErr2 = nil
					memData, getDataErr2 = mem.GetData(uint(resultPointer), uint(resultLength))
					if getDataErr2 != nil {
						log.Println(getDataErr2)

						deallocteVals(vm, inputPointer)

						return
					}

					deallocteVals(vm, inputPointer)

					var output map[string]interface{}
					err := json.Unmarshal(memData, &output)
					if err != nil {
						log.Println(err)
						return
					}
				}()

				break
			}
		case "database/save":
			{
				id := packet["id"].(string)
				topicId := packet["topicId"].(string)
				memberId := packet["memberId"].(string)
				data := packet["data"].(string)
				trx := h.wasmTool.storage.CreateTrx()
				trx.Use()
				dts := adapters_model.DataUnit{Id: id}
				err := trx.Model(&adapters_model.DataUnit{}).Where("topic_id = ?", topicId).Where("member_id = ?", memberId).First(&dts).Error()
				dts = adapters_model.DataUnit{Id: id, Data: data, TopicId: topicId, MemberId: memberId}
				trx.Reset()
				if err != nil {
					trx.Create(&dts)
				} else {
					trx.Save(&dts)
				}
				trx.Push()
				break
			}
		case "database/fetch":
			{
				trx := h.wasmTool.storage.CreateTrx()
				trx.Use()
				id := packet["id"].(string)
				topicId := packet["topicId"].(string)
				memberId := packet["memberId"].(string)
				dts := adapters_model.DataUnit{Id: id}
				trx.Model(&adapters_model.DataUnit{}).Where("topic_id = ?", topicId).Where("member_id = ?", memberId).First(&dts)
				trx.Push()

				log.Println()
				log.Println("dts:")
				log.Println(dts)
				log.Println()

				go func() {

					time.Sleep(time.Duration(100) * time.Millisecond)

					var body string
					var key = "response/database/fetch"

					str, errSerialize := json.Marshal(map[string]any{
						"data":     dts.Data,
						"topicId":  topicId,
						"memberId": memberId,
						"id":       dts.Id,
					})
					if errSerialize != nil {
						log.Println(errSerialize)
						return
					}
					body = string(str)

					var lengthOfSubject = len(body)
					var lengthOfKey = len(key)

					if lengthOfKey == 0 || lengthOfSubject == 0 {
						log.Println("body or key can not be empty")
						return
					}

					vm := h.vm

					keyAllocateResult, allocErr1 := vm.Execute("malloc", int32(lengthOfKey+1))
					if allocErr1 != nil {
						log.Println(allocErr1)
						return
					}
					keyiInputPointer := keyAllocateResult[0].(int32)
					allocateResult, allocErr2 := vm.Execute("malloc", int32(lengthOfSubject+1))
					if allocErr2 != nil {
						log.Println(allocErr2)
						return
					}
					inputPointer := allocateResult[0].(int32)

					// Write the subject into the memory.
					mod := vm.GetActiveModule()
					mem := mod.FindMemory("memory")
					keyMemData, getDataErr1 := mem.GetData(uint(keyiInputPointer), uint(lengthOfKey+1))
					if getDataErr1 != nil {
						log.Println(getDataErr1)
						return
					}
					copy(keyMemData, key)
					memData, getDataErr2 := mem.GetData(uint(inputPointer), uint(lengthOfSubject+1))
					if getDataErr2 != nil {
						log.Println(getDataErr2)
						return
					}
					copy(memData, body)

					// C-string terminates by NULL.
					keyMemData[lengthOfKey] = 0
					memData[lengthOfSubject] = 0

					// Run the `greet` function. Given the pointer to the subject.
					greetResult, runErr := vm.Execute("run", int32(lengthOfKey), keyiInputPointer, int32(lengthOfSubject), inputPointer)
					if runErr != nil {
						log.Println(runErr)

						deallocteVals(vm, inputPointer)
						return
					}
					if len(greetResult) == 0 {
						log.Println("output is empty")

						deallocteVals(vm, inputPointer)
						return
					}
					outputPointer := greetResult[0].(int32)

					getDataErr2 = nil
					memData, getDataErr2 = mem.GetData(uint(outputPointer), 8)
					if getDataErr2 != nil {
						log.Println(getDataErr2)

						deallocteVals(vm, inputPointer)

						return
					}
					resultPointer := binary.LittleEndian.Uint32(memData[:4])
					resultLength := binary.LittleEndian.Uint32(memData[4:])

					// Read the result of the `greet` function.
					getDataErr2 = nil
					memData, getDataErr2 = mem.GetData(uint(resultPointer), uint(resultLength))
					if getDataErr2 != nil {
						log.Println(getDataErr2)

						deallocteVals(vm, inputPointer)

						return
					}

					deallocteVals(vm, inputPointer)

					var output map[string]interface{}
					err := json.Unmarshal(memData, &output)
					if err != nil {
						log.Println(err)
						return
					}
				}()

				break
			}
		case "runtime/delay":
			{
				go func() {
					delayStr := packet["delay"].(string)
					delay, errParse := strconv.ParseInt(delayStr, 10, 64)
					if errParse != nil {
						log.Println(errParse)
						return
					}
					time.Sleep(time.Duration(delay) * time.Second)

					var body string
					var key = "runtime/callback"

					callbackId := packet["callbackId"].(string)

					str, errSerialize := json.Marshal(map[string]any{
						"callbackId": callbackId,
					})
					if errSerialize != nil {
						log.Println(errSerialize)
						return
					}
					body = string(str)

					var lengthOfSubject = len(body)
					var lengthOfKey = len(key)

					if lengthOfKey == 0 || lengthOfSubject == 0 {
						log.Println("body or key can not be empty")
						return
					}

					vm := h.vm

					keyAllocateResult, allocErr1 := vm.Execute("malloc", int32(lengthOfKey+1))
					if allocErr1 != nil {
						log.Println(allocErr1)
						return
					}
					keyiInputPointer := keyAllocateResult[0].(int32)
					allocateResult, allocErr2 := vm.Execute("malloc", int32(lengthOfSubject+1))
					if allocErr2 != nil {
						log.Println(allocErr2)
						return
					}
					inputPointer := allocateResult[0].(int32)

					// Write the subject into the memory.
					mod := vm.GetActiveModule()
					mem := mod.FindMemory("memory")
					keyMemData, getDataErr1 := mem.GetData(uint(keyiInputPointer), uint(lengthOfKey+1))
					if getDataErr1 != nil {
						log.Println(getDataErr1)
						return
					}
					copy(keyMemData, key)
					memData, getDataErr2 := mem.GetData(uint(inputPointer), uint(lengthOfSubject+1))
					if getDataErr2 != nil {
						log.Println(getDataErr2)
						return
					}
					copy(memData, body)

					// C-string terminates by NULL.
					keyMemData[lengthOfKey] = 0
					memData[lengthOfSubject] = 0

					// Run the `greet` function. Given the pointer to the subject.
					greetResult, runErr := vm.Execute("run", int32(lengthOfKey), keyiInputPointer, int32(lengthOfSubject), inputPointer)
					if runErr != nil {
						log.Println(runErr)

						deallocteVals(vm, inputPointer)
						return
					}
					if len(greetResult) == 0 {
						log.Println("output is empty")

						deallocteVals(vm, inputPointer)
						return
					}
					outputPointer := greetResult[0].(int32)

					getDataErr2 = nil
					memData, getDataErr2 = mem.GetData(uint(outputPointer), 8)
					if getDataErr2 != nil {
						log.Println(getDataErr2)

						deallocteVals(vm, inputPointer)

						return
					}
					resultPointer := binary.LittleEndian.Uint32(memData[:4])
					resultLength := binary.LittleEndian.Uint32(memData[4:])

					// Read the result of the `greet` function.
					getDataErr2 = nil
					memData, getDataErr2 = mem.GetData(uint(resultPointer), uint(resultLength))
					if getDataErr2 != nil {
						log.Println(getDataErr2)

						deallocteVals(vm, inputPointer)

						return
					}

					deallocteVals(vm, inputPointer)

					var output map[string]interface{}
					err := json.Unmarshal(memData, &output)
					if err != nil {
						log.Println(err)
						return
					}

				}()
				break
			}
		case "topics/send":
			{
				value := packet["value"].(map[string]any)
				var machineId = tags[h.key].Val
				var spaceId = value["spaceId"].(string)
				var topicId = value["topicId"].(string)
				var memberId = value["memberId"].(string)
				var recvId = ""
				var recvIdRaw, ok = value["recvId"]
				if ok {
					recvId = recvIdRaw.(string)
				}
				var transferType = value["type"].(string)
				var dataVal = value["data"].(map[string]any)
				dataStr, err2 := json.Marshal(dataVal)
				if err2 != nil {
					h.wasmTool.logger.Println(err2)
				}
				var inp = inputs_topics.SendInput{
					Type:     transferType,
					TopicId:  topicId,
					SpaceId:  spaceId,
					MemberId: memberId,
					RecvId:   recvId,
					Data:     string(dataStr),
				}
				log.Println(inp)
				go func() {

					time.Sleep(time.Duration(1000) * time.Millisecond)

					stateOfReq := h.wasmTool.sigmaCore.Get(1).Sb().NewState(moduleactormodel.NewInfo(machineId, spaceId, topicId))
					_, res, _ := h.wasmTool.sigmaCore.Get(1).Actor().FetchAction("/topics/send").Act(stateOfReq, inp)
					stateOfReq.(statel1.IStateL1).Trx().Push()
					h.wasmTool.logger.Println(res)
				}()
				break
			}
		}
	}
}

func (h *vmHost) message(_ interface{}, callframe *wasmedge.CallingFrame, params []interface{}) ([]interface{}, wasmedge.Result) {

	dataRaw := h.remotePtrToString(params[0].(int32), callframe)
	h.wasmTool.logger.Println(dataRaw)
	packet := map[string]any{}
	err := json.Unmarshal([]byte(dataRaw), &packet)
	if err != nil {
		h.wasmTool.logger.Println(err)
	}

	wasmPipe <- WasmPacket{data: packet, host: h}

	return []interface{}{interface{}(h.localStringToPtr("response for message", callframe))}, wasmedge.Result_Success
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
			vm, err := wm.prepareVm(wm.storageRoot+pluginsTemplateName+file.Name()+"/module.wasm", file.Name())
			if err != nil {
				wm.logger.Println(err)
				continue
			}

			oldVm, ok := wm.PluginVmsByKey[file.Name()]
			if ok {
				oldVm.Release()
			}
			wm.PluginVmsByKey[file.Name()] = vm

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
				wm.injectModule(vm, file.Name(), f)
			}
		}
	}
}

func NewWasm(core abstract.ICore, logger *modulelogger.Logger, storageRoot string, storage adapters.IStorage) *Wasm {
	storage.AutoMigrate(&adapters_model.DataUnit{})
	wm := &Wasm{
		sigmaCore:      core,
		logger:         logger,
		storageRoot:    storageRoot,
		storage:        storage,
		PluginVms:      make(map[string]*wasmedge.VM),
		PluginVmsByKey: make(map[string]*wasmedge.VM),
		PluginMetas:    make(map[string]abstract.IAction),
	}
	wasmedge.SetLogDebugLevel()
	go wm.HandleWasmRequest()
	//wm.loadWasmModules()
	return wm
}
