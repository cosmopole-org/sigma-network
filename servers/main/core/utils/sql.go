package utils

import (
	"context"
	"fmt"
	"os"
	"sigma/main/core/core/holder"
)

func ExecuteSqlFile(path string) {
	c, ioErr := os.ReadFile(path)
	if ioErr != nil {
		panic(ioErr.Error())
	}
	sqlText := string(c)
	result4, err4 := holder.Instance().GetDatabase().GetDb().Exec(context.Background(), string(sqlText))
	if err4 != nil {
		fmt.Println(err4)
	} else {
		fmt.Println(result4)
	}
}
