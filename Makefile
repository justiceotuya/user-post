# User Post App Docker Commands

.PHONY: help build up down logs clean dev-up dev-down prod-up prod-down db-shell db-backup db-info

# Default target
help:
	@echo "Available commands:"
	@echo "  build      - Build all Docker images"
	@echo "  dev-up     - Start development environment"
	@echo "  dev-down   - Stop development environment"
	@echo "  prod-up    - Start production environment"
	@echo "  prod-down  - Stop production environment"
	@echo "  logs       - View logs for all services"
	@echo "  clean      - Remove all containers, images, and volumes"
	@echo "  rebuild    - Clean and rebuild everything"
	@echo "  db-shell    - Access existing SQLite database shell"
	@echo "  db-backup   - Backup existing database"
	@echo "  db-info     - Show database information"

# Build all images
build:
	docker compose build

# Development environment
dev-up:
	docker compose -f docker-compose.dev.yml up -d
	@echo "🚀 Development environment started!"
	@echo "📱 Frontend: http://localhost:5173"
	@echo "🔧 Backend: http://localhost:5003"

dev-down:
	docker compose -f docker-compose.dev.yml down

# Production environment
prod-up:
	docker compose up -d
	@echo "🚀 Production environment started!"
	@echo "🌐 Application: http://localhost"
	@echo "📱 Frontend: http://localhost:3000"
	@echo "🔧 Backend: http://localhost:5003"

prod-down:
	docker compose down

# View logs
logs:
	docker compose logs -f

# Clean everything
clean:
	docker compose down -v --rmi all --remove-orphans
	docker compose -f docker-compose.dev.yml down -v --rmi all --remove-orphans
	docker system prune -af

# Rebuild everything
rebuild: clean build prod-up

# Database operations (read-only, no modifications)
db-shell:
	docker compose exec backend sqlite3 /app/data/database.db

db-backup:
	docker compose exec backend sqlite3 /app/data/database.db ".backup /app/data/backup-$(shell date +%Y%m%d_%H%M%S).db"
	@echo "Database backup created"

db-info:
	docker compose exec backend sqlite3 /app/data/database.db ".tables"
	docker compose exec backend sqlite3 /app/data/database.db "SELECT COUNT(*) as user_count FROM users;"
	docker compose exec backend sqlite3 /app/data/database.db "SELECT COUNT(*) as post_count FROM posts;"
