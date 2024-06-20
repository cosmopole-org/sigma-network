
FROM golang:1.21 AS builder
WORKDIR /app

COPY go.mod go.sum ./
COPY loader.sh ./
COPY . .

RUN go mod download
RUN go build -o main .

ENV PORT=80
EXPOSE $PORT

FROM nginx
RUN rm /etc/nginx/conf.d/default.conf
COPY --from=builder /app/nginx.conf /etc/nginx/conf.d/default.conf

RUN mkdir -p build
COPY --from=builder /app ./build
WORKDIR /build

CMD bash ./loader.sh
