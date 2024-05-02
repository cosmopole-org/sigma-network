package utils

import (
	"encoding/json"
	"errors"
	"fmt"
	"reflect"
	"strings"

	"github.com/go-playground/validator/v10"
	"github.com/mitchellh/mapstructure"
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

func ValidateWebPacket(body []byte, query map[string]string, dto any, targetType int) (any, bool, error) {
	var frame = map[string]interface{}{}
	if targetType == BODY {
		if body == nil {
			return nil, false, errors.New("body can't be empty")
		}
		err1 := json.Unmarshal(body, &frame)
		if err1 != nil {
			fmt.Println(err1)
			return nil, false, err1
		}
	} else {
		var data, err = json.Marshal(query)
		if err != nil {
			fmt.Println(err)
			return nil, false, err
		}
		err1 := json.Unmarshal(data, &frame)
		if err1 != nil {
			fmt.Println(err1)
			return nil, false, err1
		}
	}
	mapstructure.Decode(frame, &dto)
	err2 := Validate.Struct(dto)
	if err2 != nil {
		fmt.Println(err2)
		return nil, false, err2
	} else {
		return dto, true, nil
	}
}
