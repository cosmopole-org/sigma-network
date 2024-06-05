package utils

import (
	"go/parser"
	"go/token"
	"log"
	"reflect"
	"runtime"
	"strings"
)

// Get the name and path of a func
func FuncPathAndName(f interface{}) string {
	return runtime.FuncForPC(reflect.ValueOf(f).Pointer()).Name()
}

// Get the name of a func (with package path)
func FuncName(f interface{}) string {
	splitFuncName := strings.Split(FuncPathAndName(f), ".")
	return splitFuncName[len(splitFuncName)-1]
}

// Get description of a func
func FuncDescription(f interface{}) string {
	_, fileName, _, _ := runtime.Caller(3)
	fileName = strings.Replace(fileName, "pluggers", "actions", -1)
	funcName := FuncName(f)
	funcName = strings.Split(funcName, "-")[0]
	fset := token.NewFileSet()

	// Parse src
	parsedAst, err := parser.ParseFile(fset, fileName, nil, parser.ParseComments)
	if err != nil {
		log.Fatal(err)
		return ""
	}

	for _, co := range parsedAst.Comments {
		comment := strings.Trim(strings.Trim(co.Text(), "\n"), " ")
		cParts := strings.Split(comment, " ")
		if len(cParts) > 0 {
			if funcName == cParts[0] {
				return comment[len(funcName):]
			}
		}
	}
	return ""
}
