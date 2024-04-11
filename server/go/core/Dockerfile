# Start from a minimal Golang base image
FROM golang:1.17 AS builder

# Set the current working directory inside the container
WORKDIR /app

# Copy go mod and sum files to the working directory
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy the source code into the container
COPY . .

# Build the Go app
RUN CGO_ENABLED=0 GOOS=linux go build -o app .

# Start a new stage from scratch
FROM alpine:latest  

# Set necessary environment variables
ENV PORT=8080

# Copy the pre-built binary from the previous stage
COPY --from=builder /app/app /app/app

# Expose port 8080 to the outside world
EXPOSE $PORT

# Command to run the executable
CMD ["/app/app"]