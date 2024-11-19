FROM golang:1.21
WORKDIR /app

COPY go.mod go.sum ./
COPY run.sh ./
COPY . .

ENV PATH="/app/.wasmedge/bin:$PATH"
ENV LD_LIBRARY_PATH="/app/.wasmedge/lib:$LD_LIBRARY_PATH"
ENV LIBRARY_PATH="/app/.wasmedge/lib:$LIBRARY_PATH"
ENV C_INCLUDE_PATH="/app/.wasmedge/include:$C_INCLUDE_PATH"
ENV CPLUS_INCLUDE_PATH="/app/.wasmedge/include:$CPLUS_INCLUDE_PATH"
ENV WASMEDGE_LIB_DIR="/app/.wasmedge/lib"

RUN go mod download && \
    go mod tidy && \
    bash ./run.sh && \
    go build -o main .

ENV PORT=9010
EXPOSE $PORT

ENTRYPOINT [ "./main" ]
