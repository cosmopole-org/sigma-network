package utils

import (
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

