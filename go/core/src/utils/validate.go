package utils

import (
	"encoding/json"
	"fmt"
	"reflect"
	"sigma/core/src/interfaces"
	"sigma/core/src/types"
	"strings"

	"github.com/go-playground/validator/v10"
	"github.com/valyala/fasthttp"
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

func ValidateWebPacket(packet interfaces.IPacket, dto *interfaces.IDto, targetType int) bool {
	var wp = packet.(types.WebPacket)
	if targetType == BODY {
		var body = wp.GetBody()
		if body == nil {
			wp.AnswerWithJson(fasthttp.StatusBadRequest, map[string]string{}, BuildErrorJson("body can't be empty"))
			return false
		}
		err1 := json.Unmarshal(body, dto)
		if err1 != nil {
			fmt.Println(err1)
			wp.AnswerWithJson(fasthttp.StatusBadRequest, map[string]string{}, BuildErrorJson(err1.Error()))
			return false
		}
		validate := validator.New()
		LoadValidator(validate)
		err2 := validate.Struct(*dto)
		if err2 != nil {
			fmt.Println(err2)
			wp.AnswerWithJson(fasthttp.StatusBadRequest, map[string]string{}, BuildErrorJson(err2.Error()))
			return false
		} else {
			return true
		}
	} else {
		var body, err = json.Marshal(wp.GetQuery())
		if err != nil {
			fmt.Println(err)
			wp.AnswerWithJson(fasthttp.StatusBadRequest, map[string]string{}, BuildErrorJson(err.Error()))
			return false
		}
		err1 := json.Unmarshal(body, dto)
		if err1 != nil {
			fmt.Println(err1)
			wp.AnswerWithJson(fasthttp.StatusBadRequest, map[string]string{}, BuildErrorJson(err1.Error()))
			return false
		}
		validate := validator.New()
		LoadValidator(validate)
		err2 := validate.Struct(*dto)
		if err2 != nil {
			fmt.Println(err2)
			wp.AnswerWithJson(fasthttp.StatusBadRequest, map[string]string{}, BuildErrorJson(err2.Error()))
			return false
		} else {
			return true
		}
	}
}
