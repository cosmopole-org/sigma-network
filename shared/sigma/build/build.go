package main

import (
	"fmt"
	"go/parser"
	"go/token"
	"log"
	"os"
	"strings"
)

func main() {
	args := os.Args[1:]
	for i := 0; i < len(args); i++ {
		if i % 2 == 0 {
			actionsFolder := args[i + 1] + "/actions"
			entries, err := os.ReadDir(actionsFolder)
			if err != nil {
				log.Fatal(err)
			}
			for _, e := range entries {
				fmt.Println(e.Name())
				build(e.Name(), args[i + 1], args[i])
			}
		}
	}
}

func build(serviceName string, serviceRoot string, layer string) {

	var sourcePath = serviceRoot + "/actions/" + serviceName + "/" + serviceName + ".go"
	var resultFolder = serviceRoot + "/pluggers/" + serviceName

	os.MkdirAll(resultFolder, os.ModePerm)

	fset := token.NewFileSet()

	// Parse src
	parsedAst, err := parser.ParseFile(fset, sourcePath, nil, parser.ParseComments)
	if err != nil {
		log.Fatal(err)
		return
	}

	funcNames := []string{}
	for _, co := range parsedAst.Comments {
		comment := strings.Trim(strings.Trim(co.Text(), "\n"), " ")
		cParts := strings.Split(comment, " ")
		if len(cParts) > 0 {
			funcNames = append(funcNames, cParts[0])
		}
	}

	code := `
	package pluggers_` + serviceName + `

	import (
		"sigma/main/core/runtime"
		actions_` + serviceName + ` "sigma/main/` + layer + `/services/actions/` + serviceName + `"
	)
	
	type Plugger struct {
		Id      *string
		App     *runtime.App
		Actions *actions_` + serviceName + `.` + strings.ToUpper(serviceName[:1]) + serviceName[1:] + `Actions
	}
	`
	for _, funcName := range funcNames {
		code += `
		func (c *Plugger) ` + funcName + `() *runtime.Action {
			return runtime.ExtractFunction(c.App, c, c.Actions.` + funcName + `)
		}
		`
	}
	code +=
		`
	func (c *Plugger) Install() {
		// pass
	}
	
	func New(app *runtime.App, actions *actions_` + serviceName + `.` + strings.ToUpper(serviceName[:1]) + serviceName[1:] + `Actions) *Plugger {
		id := "` + serviceName + `"
		return &Plugger{Id: &id, App: app, Actions: actions}
	}
	`
	dest, err := os.OpenFile(resultFolder+"/"+serviceName+".go", os.O_WRONLY|os.O_CREATE, 0600)
	if err != nil {
		fmt.Println(err)
	}
	defer dest.Close()
	if _, err = dest.Write([]byte(code)); err != nil {
		fmt.Println(err)
	}
}
