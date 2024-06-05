FROM golang:1.21
WORKDIR /app

COPY go.mod go.sum ./
COPY run.sh ./
COPY . .

RUN go mod download
RUN go mod tidy
RUN go build -o main .

ENV PORT=9010
EXPOSE $PORT

CMD bash ./run.sh
