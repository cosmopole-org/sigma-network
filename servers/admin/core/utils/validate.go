package utils

import (
	"encoding/json"
	"errors"
	"fmt"
	"reflect"
	"strings"

	"github.com/go-playground/validator/v10"
)

func NotBlank(fl validator.FieldLevel) bool {
	field := fl.Field()

	switch field.Kind() {
	case reflect.String:
		return len(strings.TrimSpace(field.String())) > 0
	case reflect.Chan, reflect.Map, reflect.Slice, reflect.Array:
		return field.Len() > 0
	case reflect.Ptr, reflect.Interface, reflect.Func:
		return !field.IsNil()
	default:
		return field.IsValid() && field.Interface() != reflect.Zero(field.Type()).Interface()
	}
}

func LoadValidator(v *validator.Validate) {
	v.RegisterValidation("notblank", NotBlank)
}

const (
	BODY  = 1
	QUERY = 2
)

var Validate *validator.Validate

func LoadValidationSystem() {
	Validate = validator.New()
	LoadValidator(Validate)
}

func ValidateWebPacket(body []byte, query map[string]string, dto any, targetType int) (interface{}, bool, error) {
	if targetType == BODY {
		if body == nil {
			return nil, false, errors.New("body can't be empty")
		}
		nptr := reflect.New(reflect.TypeOf(dto))
		err1 := json.Unmarshal(body, nptr.Interface())
		if err1 != nil {
			fmt.Println(err1)
			return nil, false, err1
		}
		err2 := Validate.Struct(nptr.Interface())
		if err2 != nil {
			fmt.Println(err2)
			return nil, false, err2
		} else {
			return nptr.Interface(), true, nil
		}
	} else {
		var data, err = json.Marshal(query)
		if err != nil {
			fmt.Println(err)
			return nil, false, err
		}
		var nptr = reflect.New(reflect.TypeOf(dto))
		err1 := json.Unmarshal(data, nptr.Interface())
		if err1 != nil {
			fmt.Println(err1)
			return nil, false, err1		}
		err2 := Validate.Struct(nptr.Interface())
		if err2 != nil {
			fmt.Println(err2)
		   return nil, false, err2
		} else {
			return nptr.Interface(), true, nil
		}
	}
}
