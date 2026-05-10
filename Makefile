.PHONY: compose-up compose-down smoke-api validate-pr-ready

compose-up:
	./scripts/docker-compose.sh up -d --build

compose-down:
	./scripts/docker-compose.sh down

smoke-api:
	./scripts/smoke-api-health.sh

validate-pr-ready:
	./scripts/validate-pr-ready.sh
