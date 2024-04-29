package types

import (
	"encoding/json"
	"errors"
	"fmt"
	"mime/multipart"
	"sigma/main/core/interfaces"

	"github.com/valyala/fasthttp"
)

func (p WebPacket) GetData() any {
	return p.httpContext
}

func (p WebPacket) GetQuery() map[string]string {
	var dict = map[string]string{}
	if p.httpContext != nil {
		p.httpContext.QueryArgs().VisitAll(func(key, val []byte) {
			dict[string(key)] = string(val)
		})
	}
	return dict
}
func (p WebPacket) GetQueryParam(key string) string {
	if p.httpContext != nil {
		return string(p.httpContext.QueryArgs().Peek(key))
	}
	return ""
}

func (p WebPacket) GetHeader(key string) []byte {
	if p.httpContext != nil {
		return p.httpContext.Request.Header.Peek(key)
	}
	return []byte(p.headers[key])
}

func (p WebPacket) GetBody() []byte {
	if p.httpContext != nil {
		return p.httpContext.Request.Body()
	} else {
		return p.body
	}
}

func (p WebPacket) GetUri() string {
	if p.httpContext != nil {
		return string(p.httpContext.RequestURI()[:])
	} else {
		return p.uri
	}
}

func (p WebPacket) GetFormFile(key string) (*multipart.FileHeader, error) {
	if p.httpContext != nil {
		fh, err := p.httpContext.FormFile("data")
		return fh, err
	} else {
		return nil, errors.New("context not available")
	}
}

func (p WebPacket) Context() *fasthttp.RequestCtx {
	return p.httpContext
}

func (p WebPacket) AnswerWithJson(status int, headers map[string]string, data any) {
	if p.httpContext != nil {
		p.httpContext.SetStatusCode(status)
		p.httpContext.SetContentType("application/json")
		for k, v := range headers {
			p.httpContext.Response.Header.Set(k, v)
		}
		p.httpContext.Response.Header.Set("Access-Control-Allow-Origin", "*")
		p.httpContext.Response.Header.Set("Access-Control-Allow-Headers", "*")
		p.httpContext.Response.Header.Set("Access-Control-Allow-Methods", "*")
		var output, err = json.Marshal(data)
		if err != nil {
			fmt.Println(err)
			p.httpContext.SetStatusCode(status)
		} else {
			p.httpContext.SetBody(output)
		}
	} else {
		var output, err = json.Marshal(data)
		if err != nil {
			fmt.Println(err)
		} else {
			p.onAnswer([]byte(p.requestId + " " + string(output)))
		}
	}
}

func (p WebPacket) AnswerWithFile(status int, headers map[string]string, filePath string) {
	if p.httpContext != nil {
		p.httpContext.SetStatusCode(status)
		p.httpContext.SetContentType("application/octet-stream")
		for k, v := range headers {
			p.httpContext.Response.Header.Set(k, v)
		}
		p.httpContext.SendFile(filePath)
	}
}

func CreateWebPacket(httpContext *fasthttp.RequestCtx) interfaces.IPacket {
	return WebPacket{httpContext: httpContext}
}

func CreateWebPacketForSocket(uri string, body []byte, requestId string, onAnswer func(answer []byte)) interfaces.IPacket {
	var headers map[string]string
	err := json.Unmarshal(body, &headers)
	if err != nil {
		fmt.Println(err.Error())
	}
	fmt.Println(headers)
	return WebPacket{uri: uri, body: body, headers: headers, onAnswer: onAnswer, requestId: requestId}
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
