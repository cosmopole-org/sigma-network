package types

import (
	"encoding/json"
	"fmt"
	"sigma/core/src/interfaces"

	"github.com/valyala/fasthttp"
)

type WebPacket struct {
	httpContext *fasthttp.RequestCtx
}

func (p WebPacket) GetData() any {
	return p.httpContext
}

func (p WebPacket) GetQuery() map[string]string {
	var dict = map[string]string{}
	p.httpContext.QueryArgs().VisitAll(func(key, val []byte) {
		dict[string(key)] = string(val)
	})
	return dict
}
func (p WebPacket) GetQueryParam(key string) string {
	return string(p.httpContext.QueryArgs().Peek(key))
}

func (p WebPacket) GetHeader(key string) []byte {
	return p.httpContext.Request.Header.Peek(key)
}

func (p WebPacket) GetBody() []byte {
	return p.httpContext.Request.Body()
}

func (p WebPacket) GetUri() string {
	return string(p.httpContext.RequestURI()[:])
}

func (p WebPacket) Context() *fasthttp.RequestCtx {
	return p.httpContext
}

func (p WebPacket) AnswerWithJson(status int, headers map[string]string, data any) {
	p.httpContext.SetStatusCode(status)
	p.httpContext.SetContentType("application/json")
	for k, v := range headers {
		p.httpContext.Response.Header.Set(k, v)
	}
	var output, err = json.Marshal(data)
	if err != nil {
		fmt.Println(err)
		p.httpContext.SetStatusCode(status)
	} else {
		p.httpContext.SetBody(output)
	}
}

func CreateWebPacket(httpContext *fasthttp.RequestCtx) interfaces.IPacket {
	return WebPacket{httpContext: httpContext}
}

type LoginPacket struct {
	args []any
}

func (p LoginPacket) GetData() any {
	return p.args
}

func CreateLogicPacket(args []any) interfaces.IPacket {
	return LoginPacket{args: args}
}
