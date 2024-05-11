
FROM golang:1.21
WORKDIR /app

COPY go.mod go.sum ./
COPY loader.sh ./
COPY . .

RUN go mod download
RUN go build -o main .

ENV PORT=8081
EXPOSE $PORT

CMD bash ./loader.sh
