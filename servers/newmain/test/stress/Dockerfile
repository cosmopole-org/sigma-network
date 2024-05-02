
FROM golang:1.21

WORKDIR /app

COPY go.mod ./

COPY . .

RUN go build .

ENV PORT=8080

EXPOSE $PORT

ENTRYPOINT ["/app/test"]
