
FROM golang:1.21

WORKDIR /app

COPY go.mod go.sum ./

COPY . .

RUN go mod download

RUN go build -o admin .

ENV PORT=8080

EXPOSE $PORT

ENTRYPOINT ["/app/admin"]
