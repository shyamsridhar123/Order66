# Federation Platform - Implementation Guide
## Quick Wins & Production Readiness Roadmap

**Version:** 1.0
**Date:** February 5, 2026
**Target Audience:** Development Team

---

## Overview

This guide provides **ready-to-implement code** for the top priority improvements identified in the technical review. Each section includes complete working code that can be dropped into the codebase with minimal modifications.

---

## Quick Reference

| Implementation | Files to Modify | Effort | Priority |
|----------------|-----------------|--------|----------|
| Error Handling | `backend/app/services/llm_service.py` | 2h | 🔴 Critical |
| Rate Limiting | `backend/app/main.py` | 1h | 🔴 Critical |
| Docker Setup | `Dockerfile`, `docker-compose.yml` | 3h | 🔴 Critical |
| CI/CD Pipeline | `.github/workflows/ci.yml` | 2h | 🔴 Critical |
| Caching Layer | `backend/app/services/cache_service.py` | 3h | 🟡 High |
| Agent Registry | `backend/app/agents/registry.py` | 4h | 🟡 High |

---

## 1. Enhanced Error Handling (2 hours) 🔴

### Problem
LLM service calls can fail due to rate limits, network issues, or API errors with no graceful handling.

### Solution

#### Step 1: Create Custom Exceptions

```python
# backend/app/exceptions.py
"""Custom exceptions for the application."""

class FederationError(Exception):
    """Base exception for all application errors."""
    pass


class LLMServiceError(FederationError):
    """Raised when LLM service encounters an error."""
    def __init__(self, message: str, original_error: Exception = None):
        super().__init__(message)
        self.original_error = original_error


class RateLimitError(LLMServiceError):
    """Raised when API rate limit is hit."""
    pass


class APIConnectionError(LLMServiceError):
    """Raised when cannot connect to API."""
    pass


class InvalidResponseError(LLMServiceError):
    """Raised when API returns invalid response."""
    pass
```

#### Step 2: Update LLM Service with Error Handling

```python
# backend/app/services/llm_service.py
"""Enhanced LLM service with error handling and retries."""

import asyncio
import logging
from typing import Optional, AsyncIterator
import openai
from openai import AsyncAzureOpenAI

from app.config import settings
from app.exceptions import (
    LLMServiceError,
    RateLimitError,
    APIConnectionError,
    InvalidResponseError,
)

logger = logging.getLogger(__name__)


class LLMService:
    """LLM service with enhanced error handling."""

    def __init__(self):
        self.client = AsyncAzureOpenAI(
            api_key=settings.azure_openai_api_key,
            api_version=settings.azure_openai_api_version,
            azure_endpoint=settings.azure_openai_endpoint,
        )
        self.deployment = settings.azure_openai_deployment_name
        self.max_retries = 3
        self.retry_delay = 2  # seconds

    async def complete(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 4096,
        **kwargs,
    ) -> str:
        """
        Generate completion with automatic retry logic.

        Args:
            prompt: User prompt
            system_prompt: System prompt (optional)
            temperature: Sampling temperature
            max_tokens: Maximum tokens to generate

        Returns:
            Generated completion text

        Raises:
            RateLimitError: When rate limit exceeded
            APIConnectionError: When cannot connect to API
            InvalidResponseError: When response is malformed
            LLMServiceError: For other errors
        """
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        for attempt in range(self.max_retries):
            try:
                response = await self.client.chat.completions.create(
                    model=self.deployment,
                    messages=messages,
                    temperature=temperature,
                    max_tokens=max_tokens,
                    **kwargs,
                )

                # Validate response
                if not response.choices:
                    raise InvalidResponseError("No choices in response")

                content = response.choices[0].message.content
                if not content:
                    raise InvalidResponseError("Empty content in response")

                return content

            except openai.RateLimitError as e:
                logger.warning(f"Rate limit hit (attempt {attempt + 1}/{self.max_retries}): {e}")
                if attempt == self.max_retries - 1:
                    raise RateLimitError(
                        "AI service rate limit exceeded. Please try again later.",
                        original_error=e,
                    )
                await asyncio.sleep(self.retry_delay * (attempt + 1))  # Exponential backoff

            except openai.APIConnectionError as e:
                logger.error(f"API connection error (attempt {attempt + 1}/{self.max_retries}): {e}")
                if attempt == self.max_retries - 1:
                    raise APIConnectionError(
                        "Cannot connect to AI service. Please check your connection.",
                        original_error=e,
                    )
                await asyncio.sleep(self.retry_delay)

            except openai.APIError as e:
                logger.error(f"OpenAI API error: {e}")
                raise LLMServiceError(
                    "AI service encountered an error. Please try again.",
                    original_error=e,
                )

            except Exception as e:
                logger.error(f"Unexpected error in LLM service: {e}")
                raise LLMServiceError(
                    "Unexpected error occurred. Please contact support.",
                    original_error=e,
                )

    async def stream(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        **kwargs,
    ) -> AsyncIterator[str]:
        """
        Stream completion with error handling.

        Args:
            prompt: User prompt
            system_prompt: System prompt (optional)

        Yields:
            Completion tokens

        Raises:
            LLMServiceError: On various errors
        """
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        try:
            stream = await self.client.chat.completions.create(
                model=self.deployment,
                messages=messages,
                stream=True,
                **kwargs,
            )

            async for chunk in stream:
                if chunk.choices and chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content

        except openai.RateLimitError as e:
            logger.error(f"Rate limit during streaming: {e}")
            raise RateLimitError(
                "AI service rate limit exceeded during streaming.",
                original_error=e,
            )

        except openai.APIError as e:
            logger.error(f"API error during streaming: {e}")
            raise LLMServiceError(
                "AI service error during streaming.",
                original_error=e,
            )

        except Exception as e:
            logger.error(f"Unexpected error during streaming: {e}")
            raise LLMServiceError(
                "Unexpected streaming error.",
                original_error=e,
            )
```

#### Step 3: Add Global Exception Handler

```python
# backend/app/main.py
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from app.exceptions import FederationError, RateLimitError, APIConnectionError

# ... existing code ...

@app.exception_handler(RateLimitError)
async def rate_limit_handler(request: Request, exc: RateLimitError):
    """Handle rate limit errors."""
    return JSONResponse(
        status_code=429,
        content={
            "error": "rate_limit_exceeded",
            "message": str(exc),
            "retry_after": 60,
        },
    )


@app.exception_handler(APIConnectionError)
async def connection_error_handler(request: Request, exc: APIConnectionError):
    """Handle API connection errors."""
    return JSONResponse(
        status_code=503,
        content={
            "error": "service_unavailable",
            "message": str(exc),
        },
    )


@app.exception_handler(FederationError)
async def federation_error_handler(request: Request, exc: FederationError):
    """Handle all custom application errors."""
    return JSONResponse(
        status_code=500,
        content={
            "error": "internal_error",
            "message": str(exc),
        },
    )
```

---

## 2. Rate Limiting (1 hour) 🔴

### Problem
No rate limiting allows abuse and runaway costs.

### Solution

#### Step 1: Install Dependencies

```bash
cd backend
pip install slowapi
pip freeze | grep slowapi >> requirements.txt
```

#### Step 2: Add Rate Limiting Middleware

```python
# backend/app/middleware/rate_limit.py
"""Rate limiting middleware."""

from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request
from fastapi.responses import JSONResponse

# Create limiter instance
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["100/hour"],  # Default: 100 requests per hour per IP
)


async def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
    """Handle rate limit exceeded."""
    return JSONResponse(
        status_code=429,
        content={
            "error": "rate_limit_exceeded",
            "message": "Too many requests. Please slow down.",
            "retry_after": 3600,
        },
    )
```

#### Step 3: Apply to Main App

```python
# backend/app/main.py
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.middleware.rate_limit import limiter

# ... existing code ...

app = FastAPI(...)

# Add rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ... rest of setup ...
```

#### Step 4: Apply to Expensive Endpoints

```python
# backend/app/api/routes/chat.py
from app.middleware.rate_limit import limiter

@router.post("/conversations/{conversation_id}/messages")
@limiter.limit("10/minute")  # 10 messages per minute
async def send_message(
    request: Request,  # Required for limiter
    conversation_id: str,
    message: MessageCreate,
    db: AsyncSession = Depends(get_db),
):
    """Send message with rate limiting."""
    # ... existing code ...
```

```python
# backend/app/api/routes/proposals.py
@router.post("/generate")
@limiter.limit("5/hour")  # Only 5 proposals per hour
async def generate_proposal(
    request: Request,
    proposal_request: ProposalRequest,
    db: AsyncSession = Depends(get_db),
):
    """Generate proposal with strict rate limiting."""
    # ... existing code ...
```

---

## 3. Docker Setup (3 hours) 🔴

### Solution

#### Backend Dockerfile

```dockerfile
# backend/Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY app/ ./app/
COPY setup_db.py .

# Create data directory
RUN mkdir -p /app/data

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"

# Run application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### Frontend Dockerfile

```dockerfile
# frontend/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy source and build
COPY . .
RUN pnpm build

# Production image
FROM node:20-alpine AS runner

WORKDIR /app

# Copy built files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Expose port
EXPOSE 3000

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Run
CMD ["node", "server.js"]
```

#### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: federation-backend
    ports:
      - "8000:8000"
    environment:
      - AZURE_OPENAI_API_KEY=${AZURE_OPENAI_API_KEY}
      - AZURE_OPENAI_ENDPOINT=${AZURE_OPENAI_ENDPOINT}
      - AZURE_OPENAI_API_VERSION=${AZURE_OPENAI_API_VERSION}
      - AZURE_OPENAI_DEPLOYMENT_NAME=${AZURE_OPENAI_DEPLOYMENT_NAME}
      - DATABASE_URL=sqlite+aiosqlite:///./data/federation.db
    volumes:
      - ./data:/app/data
      - ./backend/app:/app/app  # For hot reload in development
    networks:
      - federation-network
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: federation-frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8000
    depends_on:
      - backend
    networks:
      - federation-network
    restart: unless-stopped

networks:
  federation-network:
    driver: bridge

volumes:
  data:
```

#### Development Docker Compose

```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - AZURE_OPENAI_API_KEY=${AZURE_OPENAI_API_KEY}
      - AZURE_OPENAI_ENDPOINT=${AZURE_OPENAI_ENDPOINT}
      - AZURE_OPENAI_API_VERSION=${AZURE_OPENAI_API_VERSION}
      - AZURE_OPENAI_DEPLOYMENT_NAME=${AZURE_OPENAI_DEPLOYMENT_NAME}
      - DATABASE_URL=sqlite+aiosqlite:///./data/federation.db
    volumes:
      - ./backend:/app  # Full mount for hot reload
      - ./data:/app/data
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
    networks:
      - federation-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000
    volumes:
      - ./frontend:/app  # Full mount for hot reload
      - /app/node_modules
      - /app/.next
    networks:
      - federation-network

networks:
  federation-network:
    driver: bridge
```

#### Usage Commands

```bash
# Production
docker-compose up -d

# Development with hot reload
docker-compose -f docker-compose.dev.yml up

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop
docker-compose down

# Rebuild
docker-compose build --no-cache
```

---

## 4. CI/CD Pipeline (2 hours) 🔴

### Solution

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

env:
  PYTHON_VERSION: '3.11'
  NODE_VERSION: '20'

jobs:
  backend-tests:
    name: Backend Tests
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: ${{ env.PYTHON_VERSION }}

      - name: Cache pip dependencies
        uses: actions/cache@v3
        with:
          path: ~/.cache/pip
          key: ${{ runner.os }}-pip-${{ hashFiles('backend/requirements.txt') }}
          restore-keys: |
            ${{ runner.os }}-pip-

      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt

      - name: Run tests
        run: |
          cd backend
          pytest -v --cov=app --cov-report=xml --cov-report=term

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./backend/coverage.xml
          flags: backend

  backend-lint:
    name: Backend Linting
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: ${{ env.PYTHON_VERSION }}

      - name: Install linting tools
        run: |
          pip install ruff black mypy

      - name: Run ruff
        run: |
          cd backend
          ruff check app/

      - name: Check formatting
        run: |
          cd backend
          black --check app/

      - name: Type checking
        run: |
          cd backend
          mypy app/ --ignore-missing-imports

  frontend-tests:
    name: Frontend Tests
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Install pnpm
        run: npm install -g pnpm

      - name: Cache pnpm dependencies
        uses: actions/cache@v3
        with:
          path: ~/.pnpm-store
          key: ${{ runner.os }}-pnpm-${{ hashFiles('frontend/pnpm-lock.yaml') }}
          restore-keys: |
            ${{ runner.os }}-pnpm-

      - name: Install dependencies
        run: |
          cd frontend
          pnpm install --frozen-lockfile

      - name: Run linter
        run: |
          cd frontend
          pnpm lint

      - name: Build
        run: |
          cd frontend
          pnpm build

  security-scan:
    name: Security Scanning
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: ${{ env.PYTHON_VERSION }}

      - name: Install safety
        run: pip install safety

      - name: Run security audit
        run: |
          cd backend
          safety check -r requirements.txt --continue-on-error

  docker-build:
    name: Docker Build Test
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Build backend image
        run: |
          cd backend
          docker build -t federation-backend:test .

      - name: Build frontend image
        run: |
          cd frontend
          docker build -t federation-frontend:test .
```

---

## 5. Caching Layer (3 hours) 🟡

### Solution

```python
# backend/app/services/cache_service.py
"""In-memory caching service for LLM responses and expensive computations."""

import hashlib
import json
import time
from typing import Any, Optional, Dict
from collections import OrderedDict
import logging

logger = logging.getLogger(__name__)


class CacheService:
    """LRU cache with TTL support."""

    def __init__(self, max_size: int = 1000, default_ttl: int = 3600):
        """
        Initialize cache service.

        Args:
            max_size: Maximum number of items in cache
            default_ttl: Default time-to-live in seconds
        """
        self._cache: OrderedDict[str, Dict[str, Any]] = OrderedDict()
        self._max_size = max_size
        self._default_ttl = default_ttl
        self._hits = 0
        self._misses = 0

    def _generate_key(self, namespace: str, *args, **kwargs) -> str:
        """Generate cache key from namespace and arguments."""
        key_data = {
            "namespace": namespace,
            "args": args,
            "kwargs": sorted(kwargs.items()),
        }
        key_string = json.dumps(key_data, sort_keys=True)
        return hashlib.sha256(key_string.encode()).hexdigest()

    def get(self, namespace: str, *args, **kwargs) -> Optional[Any]:
        """
        Get value from cache.

        Args:
            namespace: Cache namespace (e.g., 'llm_completion')
            args: Positional arguments for key generation
            kwargs: Keyword arguments for key generation

        Returns:
            Cached value or None if not found/expired
        """
        key = self._generate_key(namespace, *args, **kwargs)

        if key in self._cache:
            entry = self._cache[key]

            # Check if expired
            if time.time() > entry["expires_at"]:
                del self._cache[key]
                self._misses += 1
                logger.debug(f"Cache expired: {namespace}")
                return None

            # Move to end (LRU)
            self._cache.move_to_end(key)
            self._hits += 1
            logger.debug(f"Cache hit: {namespace}")
            return entry["value"]

        self._misses += 1
        logger.debug(f"Cache miss: {namespace}")
        return None

    def set(
        self,
        namespace: str,
        value: Any,
        ttl: Optional[int] = None,
        *args,
        **kwargs,
    ) -> None:
        """
        Set value in cache.

        Args:
            namespace: Cache namespace
            value: Value to cache
            ttl: Time-to-live in seconds (uses default if not specified)
            args: Positional arguments for key generation
            kwargs: Keyword arguments for key generation
        """
        key = self._generate_key(namespace, *args, **kwargs)
        ttl = ttl if ttl is not None else self._default_ttl

        # Evict oldest if at capacity
        if len(self._cache) >= self._max_size:
            oldest_key = next(iter(self._cache))
            del self._cache[oldest_key]
            logger.debug(f"Cache evicted: {oldest_key}")

        self._cache[key] = {
            "value": value,
            "expires_at": time.time() + ttl,
        }
        logger.debug(f"Cache set: {namespace} (TTL: {ttl}s)")

    def invalidate(self, namespace: str, *args, **kwargs) -> bool:
        """
        Invalidate specific cache entry.

        Args:
            namespace: Cache namespace
            args: Positional arguments for key generation
            kwargs: Keyword arguments for key generation

        Returns:
            True if entry was found and removed
        """
        key = self._generate_key(namespace, *args, **kwargs)
        if key in self._cache:
            del self._cache[key]
            logger.debug(f"Cache invalidated: {namespace}")
            return True
        return False

    def clear(self) -> None:
        """Clear all cache entries."""
        self._cache.clear()
        self._hits = 0
        self._misses = 0
        logger.info("Cache cleared")

    def stats(self) -> Dict[str, Any]:
        """Get cache statistics."""
        total_requests = self._hits + self._misses
        hit_rate = (self._hits / total_requests * 100) if total_requests > 0 else 0

        return {
            "size": len(self._cache),
            "max_size": self._max_size,
            "hits": self._hits,
            "misses": self._misses,
            "hit_rate": f"{hit_rate:.2f}%",
        }


# Global cache instance
_cache_service = None


def get_cache_service() -> CacheService:
    """Get global cache service instance."""
    global _cache_service
    if _cache_service is None:
        _cache_service = CacheService(max_size=1000, default_ttl=3600)
    return _cache_service
```

#### Integration with LLM Service

```python
# backend/app/services/llm_service.py
from app.services.cache_service import get_cache_service

class LLMService:
    def __init__(self):
        # ... existing init ...
        self.cache = get_cache_service()

    async def complete(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        use_cache: bool = True,
        **kwargs,
    ) -> str:
        """Generate completion with caching."""

        # Try cache first
        if use_cache:
            cached = self.cache.get(
                "llm_completion",
                prompt=prompt,
                system_prompt=system_prompt,
                **kwargs,
            )
            if cached is not None:
                logger.info("Using cached LLM response")
                return cached

        # Make API call
        result = await self._make_completion_call(prompt, system_prompt, **kwargs)

        # Cache result
        if use_cache:
            self.cache.set(
                "llm_completion",
                result,
                ttl=3600,  # 1 hour
                prompt=prompt,
                system_prompt=system_prompt,
                **kwargs,
            )

        return result
```

#### Cache Stats Endpoint

```python
# backend/app/api/routes/analytics.py
from app.services.cache_service import get_cache_service

@router.get("/cache-stats")
async def get_cache_stats():
    """Get cache statistics."""
    cache = get_cache_service()
    return cache.stats()
```

---

## 6. Testing Improvements (4 hours) 🟡

### Integration Tests

```python
# backend/tests/integration/test_proposal_workflow.py
"""Integration tests for full proposal generation workflow."""

import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_full_proposal_generation_flow(client: AsyncClient, db_session):
    """Test complete proposal generation through all agents."""

    # Step 1: Create conversation
    response = await client.post(
        "/api/chat/conversations",
        json={"title": "Acme Corp Proposal"},
    )
    assert response.status_code == 200
    conversation_id = response.json()["id"]

    # Step 2: Send message requesting proposal
    response = await client.post(
        f"/api/chat/conversations/{conversation_id}/messages",
        json={
            "content": "Generate a proposal for Acme Corp's digital transformation. "
                      "They are a $5B manufacturing company.",
            "role": "user",
        },
    )
    assert response.status_code == 200
    message_data = response.json()

    # Step 3: Verify response structure
    assert "id" in message_data
    assert message_data["role"] == "assistant"
    assert len(message_data["content"]) > 100

    # Step 4: Check that agent traces were created
    traces_response = await client.get(f"/api/analytics/traces")
    traces = traces_response.json()
    assert len(traces) > 0

    # Verify orchestrator was involved
    orchestrator_traces = [t for t in traces if t["agent_name"] == "orchestrator"]
    assert len(orchestrator_traces) > 0

    # Step 5: Verify proposal content
    content = message_data["content"].lower()
    assert any(term in content for term in ["proposal", "executive summary", "approach"])


@pytest.mark.asyncio
async def test_research_briefing_workflow(client: AsyncClient):
    """Test research briefing generation."""

    response = await client.post(
        "/api/research/briefing",
        json={
            "company_name": "TechCorp Inc",
            "topics": ["financials", "strategy", "competitors"],
        },
    )

    assert response.status_code == 200
    briefing = response.json()

    assert "company_overview" in briefing
    assert "key_findings" in briefing
    assert len(briefing["key_findings"]) > 0
```

---

## 7. Monitoring & Logging (3 hours) 🟡

### Structured Logging

```python
# backend/app/logging_config.py
"""Structured logging configuration."""

import logging
import json
from datetime import datetime
from typing import Any, Dict


class StructuredFormatter(logging.Formatter):
    """JSON formatter for structured logging."""

    def format(self, record: logging.LogRecord) -> str:
        """Format log record as JSON."""
        log_data: Dict[str, Any] = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }

        # Add exception info if present
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)

        # Add extra fields
        if hasattr(record, "extra"):
            log_data.update(record.extra)

        return json.dumps(log_data)


def setup_logging(level: str = "INFO") -> None:
    """Setup structured logging."""
    handler = logging.StreamHandler()
    handler.setFormatter(StructuredFormatter())

    root_logger = logging.getLogger()
    root_logger.setLevel(level)
    root_logger.addHandler(handler)

    # Suppress noisy loggers
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)
```

```python
# backend/app/main.py
from app.logging_config import setup_logging

# Setup logging at startup
setup_logging(level="INFO" if settings.app_env == "production" else "DEBUG")
```

---

## Summary Checklist

### Immediate Actions (This Week)
- [ ] Implement enhanced error handling in LLM service
- [ ] Add rate limiting to expensive endpoints
- [ ] Create Docker setup for easy deployment
- [ ] Add CI/CD pipeline with GitHub Actions
- [ ] Update requirements.txt with new dependencies

### Next Sprint
- [ ] Implement caching layer
- [ ] Add integration tests
- [ ] Setup structured logging
- [ ] Create monitoring dashboard

### Production Readiness
- [ ] Add authentication middleware
- [ ] Implement circuit breakers
- [ ] Setup observability (metrics, traces)
- [ ] Database migration strategy
- [ ] Security audit

---

**Next Steps:**
1. Review this guide with the team
2. Prioritize implementations based on immediate needs
3. Create tickets for each implementation
4. Start with Critical items (🔴)
5. Test thoroughly in development before production

**Questions?** Refer to the main [REVIEW.md](./REVIEW.md) for detailed analysis.
