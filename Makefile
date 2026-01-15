.PHONY: start stop help

# Default port
PORT ?= 8080

## help: Show this help message
help:
	@echo "AlgoQuest - Algorithm Pattern Quiz Game"
	@echo ""
	@echo "Usage:"
	@echo "  make start       Start the development server on port $(PORT)"
	@echo "  make stop        Stop the development server"
	@echo "  make help        Show this help message"
	@echo ""
	@echo "Options:"
	@echo "  PORT=<number>    Specify a custom port (default: 8080)"
	@echo ""
	@echo "Examples:"
	@echo "  make start"
	@echo "  make start PORT=3000"

## start: Start the development server
start:
	@echo "🚀 Starting AlgoQuest server on http://localhost:$(PORT)"
	@python3 -m http.server $(PORT)

## stop: Stop the development server
stop:
	@echo "🛑 Stopping server..."
	@pkill -f "python3 -m http.server" 2>/dev/null || echo "Server not running"
