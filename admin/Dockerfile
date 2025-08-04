# Use official Go image
FROM golang:1.22-alpine

# Set working directory inside container
WORKDIR /app

# Copy go mod files and install dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy the source code
COPY . .

# Build the binary
RUN go build -o admin .

# Run the compiled binary
CMD ["./admin"]
