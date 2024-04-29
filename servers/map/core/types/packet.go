package types

import (
	"encoding/json"
	"errors"
	"fmt"
	"mime/multipart"

	"github.com/valyala/fasthttp"
)

type WebPacket struct {
	Uri         string
	Body        []byte
	Headers     map[string]string
	HttpContext *fasthttp.RequestCtx
	OnAnswer    func(answer []byte)
	RequestId   string
}

func (p WebPacket) GetData() any {
	return p.HttpContext
}

func (p WebPacket) GetQuery() map[string]string {
	var dict = map[string]string{}
	if p.HttpContext != nil {
		p.HttpContext.QueryArgs().VisitAll(func(key, val []byte) {
			dict[string(key)] = string(val)
		})
	}
	return dict
}
func (p WebPacket) GetQueryParam(key string) string {
	if p.HttpContext != nil {
		return string(p.HttpContext.QueryArgs().Peek(key))
	}
	return ""
}

func (p WebPacket) GetHeader(key string) []byte {
	if p.HttpContext != nil {
		return p.HttpContext.Request.Header.Peek(key)
	}
	return []byte(p.Headers[key])
}

func (p WebPacket) GetBody() []byte {
	if p.HttpContext != nil {
		return p.HttpContext.Request.Body()
	} else {
		return p.Body
	}
}

func (p WebPacket) GetUri() string {
	if p.HttpContext != nil {
		return string(p.HttpContext.RequestURI()[:])
	} else {
		return p.Uri
	}
}

func (p WebPacket) GetFormFile(key string) (*multipart.FileHeader, error) {
	if p.HttpContext != nil {
		fh, err := p.HttpContext.FormFile("data")
		return fh, err
	} else {
		return nil, errors.New("context not available")
	}
}

func (p WebPacket) Context() *fasthttp.RequestCtx {
	return p.HttpContext
}

func (p WebPacket) AnswerWithJson(status int, headers map[string]string, data any) {
	if p.HttpContext != nil {
		p.HttpContext.SetStatusCode(status)
		p.HttpContext.SetContentType("application/json")
		for k, v := range headers {
			p.HttpContext.Response.Header.Set(k, v)
		}
		p.HttpContext.Response.Header.Set("Access-Control-Allow-Origin", "*")
		p.HttpContext.Response.Header.Set("Access-Control-Allow-Headers", "*")
		p.HttpContext.Response.Header.Set("Access-Control-Allow-Methods", "*")
		var output, err = json.Marshal(data)
		if err != nil {
			fmt.Println(err)
			p.HttpContext.SetStatusCode(status)
		} else {
			p.HttpContext.SetBody(output)
		}
	} else {
		var output, err = json.Marshal(data)
		if err != nil {
			fmt.Println(err)
		} else {
			p.OnAnswer([]byte(p.RequestId + " " + string(output)))
		}
	}
}

func (p WebPacket) AnswerWithFile(status int, headers map[string]string, filePath string) {
	if p.HttpContext != nil {
		p.HttpContext.SetStatusCode(status)
		p.HttpContext.SetContentType("application/octet-stream")
		for k, v := range headers {
			p.HttpContext.Response.Header.Set(k, v)
		}
		p.HttpContext.SendFile(filePath)
	}
}

func CreateWebPacket(HttpContext *fasthttp.RequestCtx) IPacket {
	return WebPacket{HttpContext: HttpContext}
}

func CreateWebPacketForSocket(uri string, body []byte, requestId string, onAnswer func(answer []byte)) IPacket {
	var headers map[string]string
	err := json.Unmarshal(body, &headers)
	if err != nil {
		fmt.Println(err.Error())
	}
	fmt.Println(headers)
	return WebPacket{Uri: uri, Body: body, Headers: headers, OnAnswer: onAnswer, RequestId: requestId}
}

type LoginPacket struct {
	Args []any
}

func (p LoginPacket) GetData() any {
	return p.Args
}

func CreateLogicPacket(args []any) IPacket {
	return LoginPacket{Args: args}
}
