package services_native_storage

import (
	"fmt"
	outputs_storage "sigma/core/src/outputs/storage"
	"sigma/core/src/types"

	"github.com/valyala/fasthttp"
)

func HandleBinaryDataToStorage(storageRoot string, ctx *fasthttp.RequestCtx, packet types.WebPacket, assistant *types.Assistant) {
	fh, err := ctx.FormFile("data")
	if err != nil {
		fmt.Println(err)
		packet.AnswerWithJson(fasthttp.StatusInternalServerError, map[string]string{}, outputs_storage.Binary{})
		return
	}
	if err := assistant.SaveToStorage(storageRoot, fh, string(packet.GetHeader("data_key"))); err != nil {
		fmt.Println(err)
		packet.AnswerWithJson(fasthttp.StatusInternalServerError, map[string]string{}, outputs_storage.Binary{})
		return
	}
	packet.AnswerWithJson(fasthttp.StatusOK, map[string]string{}, outputs_storage.Binary{})
	return
}
