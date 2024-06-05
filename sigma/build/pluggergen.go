package main

import (
	"go/parser"
	"go/token"
	"log"
	"os"
	"strings"
)

func main() {
	args := os.Args[1:]
	for i := 0; i < len(args); i++ {
		serviceRoot := args[i]
		actionsFolder := serviceRoot + "/actions"
		pluggerPathParts := strings.Split(serviceRoot, "/")
		pluggerName := pluggerPathParts[len(pluggerPathParts)-1]
		code := `
		package plugger_` + pluggerName + `

		import (
			"reflect"
			"sigma/sigma/abstract"
			module_logger "sigma/sigma/core/module/logger"

		`
		entries, err := os.ReadDir(actionsFolder)
		if err != nil {
			log.Fatal(err)
		}
		var serviceNames []string
		for _, e := range entries {
			serviceName := e.Name()
			build(serviceName, serviceRoot)
			serviceNames = append(serviceNames, serviceName)
			code += `
			plugger_` + serviceName + ` "sigma/` + pluggerName + `/pluggers/` + serviceName + `"
			action_` + serviceName + ` "sigma/` + pluggerName + `/actions/` + serviceName + `"
			`
		}
		code += `
		)

		func PlugThePlugger(layer abstract.ILayer, plugger interface{}) {
			s := reflect.TypeOf(plugger)
			for i := 0; i < s.NumMethod(); i++ {
				f := s.Method(i)
				if f.Name == "Install" {
					f.Func.Call([]reflect.Value{reflect.ValueOf(plugger)})
				} else {
					result := f.Func.Call([]reflect.Value{reflect.ValueOf(plugger)})
					action := result[0].Interface().(abstract.IAction)
					layer.Actor().InjectAction(action)
				}
			}
		}
	
		func PlugAll(layer abstract.ILayer, logger *module_logger.Logger, core abstract.ICore) {
		`
		for _, serviceName := range serviceNames {
			code += `
				PlugThePlugger(layer, plugger_` + serviceName + `.New(&action_` + serviceName + `.Actions{Layer: layer}, logger, core))
			`
		}
		code += `
		}
		`
		err2 := os.MkdirAll(serviceRoot+"/main", os.ModePerm)
		if err2 != nil {
			log.Fatal(err2)
			return
		}
		writeToFile(serviceRoot+"/main/"+pluggerName+".go", code)
	}
}

func build(serviceName string, serviceRoot string) {

	var sourcePath = serviceRoot + "/actions/" + serviceName + "/" + serviceName + ".go"
	var resultFolder = serviceRoot + "/pluggers/" + serviceName

	err := os.MkdirAll(resultFolder, os.ModePerm)
	if err != nil {
		log.Fatal(err)
		return
	}

	fSet := token.NewFileSet()

	// Parse src
	parsedAst, err := parser.ParseFile(fSet, sourcePath, nil, parser.ParseComments)
	if err != nil {
		log.Fatal(err)
		return
	}

	var funcNames []string
	for _, co := range parsedAst.Comments {
		comment := strings.Trim(strings.Trim(co.Text(), "\n"), " ")
		cParts := strings.Split(comment, " ")
		if len(cParts) > 0 {
			funcNames = append(funcNames, cParts[0])
		}
	}

	code := `
	package plugger_` + serviceName + `

	import (
		"sigma/sigma/abstract"
		"sigma/sigma/utils"
		module_logger "sigma/sigma/core/module/logger"
		actions "sigma/sigverse/actions/` + serviceName + `"
	)
	
	type Plugger struct {
		Id      *string
		Actions *actions.Actions
		Logger *module_logger.Logger
		Core abstract.ICore
	}
	`
	for _, funcName := range funcNames {
		code += `
		func (c *Plugger) ` + funcName + `() abstract.IAction {
			return utils.ExtractSecureAction(c.Logger, c.Core, c.Actions.` + funcName + `)
		}
		`
	}
	code +=
		`
	func (c *Plugger) Install() {
		// pass
	}
	
	func New(actions *actions.Actions, logger *module_logger.Logger, core abstract.ICore) *Plugger {
		id := "` + serviceName + `"
		return &Plugger{Id: &id, Actions: actions, Core: core, Logger: logger}
	}
	`
	writeToFile(resultFolder+"/"+serviceName+".go", code)
}

func writeToFile(path string, textContent string) {
	dest, err := os.OpenFile(path, os.O_WRONLY|os.O_CREATE, 0600)
	if err != nil {
		log.Fatal(err)
	}
	defer func(dest *os.File) {
		err := dest.Close()
		if err != nil {
			log.Fatal(err)
		}
	}(dest)
	if _, err = dest.Write([]byte(textContent)); err != nil {
		log.Fatal(err)
	}
}
