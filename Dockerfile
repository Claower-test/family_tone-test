FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json frontend/pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install
COPY frontend/ .
RUN pnpm run build

FROM golang:1.23-alpine AS backend-builder
RUN apk add --no-cache gcc musl-dev sqlite-dev
WORKDIR /app
COPY backend/go.mod backend/go.sum ./
RUN go mod download
COPY backend/ .
RUN CGO_ENABLED=1 go build -ldflags='-w -s' -o out main.go

FROM alpine:latest
RUN apk --no-cache add ca-certificates sqlite-libs
WORKDIR /app
COPY --from=backend-builder /app/out .
COPY --from=frontend-builder /app/frontend/dist ./static
RUN mkdir -p uploads/avatars
EXPOSE 8080
CMD ["./out"]
