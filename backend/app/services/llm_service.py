"""Ollama LLM Service wrapper using OpenAI-compatible API."""

import json
from typing import AsyncIterator, Any

from openai import AsyncOpenAI

from app.config import settings


class LLMResponse:
    """Response wrapper that includes content and token usage."""
    def __init__(self, content: str, tokens_used: int = 0):
        self.content = content
        self.tokens_used = tokens_used


class LLMService:
    """Service for interacting with LLM models via OpenAI-compatible API."""

    def __init__(self, base_url: str = None, api_key: str = None, chat_model: str = None, embedding_model: str = None):
        self._base_url = base_url or settings.ollama_base_url
        self._api_key = api_key or settings.ollama_api_key
        self.client = AsyncOpenAI(
            base_url=self._base_url,
            api_key=self._api_key,
        )
        # Model names
        self.chat_model = chat_model or settings.llm_chat_model
        self.embedding_model = embedding_model or settings.llm_embedding_model
        # Track total tokens for current session
        self.last_tokens_used = 0

    def update_config(self, base_url: str = None, api_key: str = None, chat_model: str = None, embedding_model: str = None):
        """Update the LLM configuration dynamically."""
        if base_url:
            self._base_url = base_url
        if api_key:
            self._api_key = api_key
        if chat_model:
            self.chat_model = chat_model
        if embedding_model:
            self.embedding_model = embedding_model
        
        # Recreate the client with new settings
        self.client = AsyncOpenAI(
            base_url=self._base_url,
            api_key=self._api_key,
        )

    async def complete(
        self,
        prompt: str,
        system_prompt: str = None,
        temperature: float = 0.7,
        max_tokens: int = 4096,
        model: str = None,
        **kwargs,
    ) -> str:
        """Generate a completion from the LLM."""
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        model_name = model or self.chat_model

        response = await self.client.chat.completions.create(
            model=model_name,
            messages=messages,
            max_tokens=max_tokens,
            temperature=temperature,
            **kwargs,
        )

        # Track token usage
        if response.usage:
            self.last_tokens_used = response.usage.total_tokens
        
        return response.choices[0].message.content

    async def complete_with_usage(
        self,
        prompt: str,
        system_prompt: str = None,
        temperature: float = 0.7,
        max_tokens: int = 4096,
        model: str = None,
        **kwargs,
    ) -> LLMResponse:
        """Generate a completion and return with token usage."""
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        model_name = model or self.chat_model

        response = await self.client.chat.completions.create(
            model=model_name,
            messages=messages,
            max_tokens=max_tokens,
            temperature=temperature,
            **kwargs,
        )

        tokens = response.usage.total_tokens if response.usage else 0
        self.last_tokens_used = tokens
        
        return LLMResponse(response.choices[0].message.content, tokens)

    async def complete_messages(
        self,
        messages: list[dict],
        temperature: float = 0.7,
        max_tokens: int = 4096,
        model: str = None,
        **kwargs,
    ) -> str:
        """Generate a completion from a list of messages."""
        model_name = model or self.chat_model

        response = await self.client.chat.completions.create(
            model=model_name,
            messages=messages,
            max_tokens=max_tokens,
            temperature=temperature,
            **kwargs,
        )

        return response.choices[0].message.content

    async def stream(
        self,
        prompt: str,
        system_prompt: str = None,
        model: str = None,
        **kwargs,
    ) -> AsyncIterator[str]:
        """Stream a completion token by token."""
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        model_name = model or self.chat_model

        stream = await self.client.chat.completions.create(
            model=model_name,
            messages=messages,
            stream=True,
            **kwargs,
        )

        async for chunk in stream:
            if chunk.choices and chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content

    async def embed(self, text: str) -> list[float]:
        """Generate embeddings for text."""
        response = await self.client.embeddings.create(
            model=self.embedding_model,
            input=text,
        )
        return response.data[0].embedding

    async def embed_batch(self, texts: list[str]) -> list[list[float]]:
        """Generate embeddings for multiple texts."""
        response = await self.client.embeddings.create(
            model=self.embedding_model,
            input=texts,
        )
        return [item.embedding for item in response.data]

    async def structured_output(
        self,
        prompt: str,
        output_schema: dict,
        system_prompt: str = None,
        model: str = None,
    ) -> dict:
        """Get structured JSON output."""
        # Build a prompt that includes the schema for Ollama
        schema_str = json.dumps(output_schema.get("schema", output_schema), indent=2)
        json_instruction = f"\n\nRespond with valid JSON matching this schema:\n{schema_str}\n\nReturn ONLY the JSON object, no other text or markdown."
        
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt + json_instruction})
        else:
            messages.append({"role": "system", "content": "You are a helpful assistant that responds only in valid JSON." + json_instruction})
        messages.append({"role": "user", "content": prompt})

        model_name = model or self.chat_model

        response = await self.client.chat.completions.create(
            model=model_name,
            messages=messages,
        )

        # Track token usage
        if response.usage:
            self.last_tokens_used = response.usage.total_tokens

        # Parse JSON from response, handling potential markdown wrapping
        content = response.choices[0].message.content.strip()
        # Remove markdown code blocks if present
        if content.startswith("```"):
            content = content.split("```")[1]
            if content.startswith("json"):
                content = content[4:]
            content = content.strip()
        
        return json.loads(content)

    async def complete_with_tools(
        self,
        messages: list[dict],
        tools: list[dict],
        model: str = None,
        **kwargs,
    ) -> dict:
        """Generate completion with tool calling support."""
        model_name = model or self.chat_model

        response = await self.client.chat.completions.create(
            model=model_name,
            messages=messages,
            tools=tools,
            **kwargs,
        )

        choice = response.choices[0]
        result = {
            "content": choice.message.content,
            "tool_calls": None,
            "finish_reason": choice.finish_reason,
        }

        if choice.message.tool_calls:
            result["tool_calls"] = [
                {
                    "id": tc.id,
                    "function": {
                        "name": tc.function.name,
                        "arguments": json.loads(tc.function.arguments),
                    },
                }
                for tc in choice.message.tool_calls
            ]

        return result


# Singleton instance
_llm_service: LLMService | None = None


def get_llm_service() -> LLMService:
    """Get or create the LLM service singleton."""
    global _llm_service
    if _llm_service is None:
        _llm_service = LLMService()
    return _llm_service


async def update_llm_config(base_url: str = None, api_key: str = None, chat_model: str = None, embedding_model: str = None):
    """Update the LLM service configuration dynamically."""
    global _llm_service
    if _llm_service is None:
        _llm_service = LLMService(base_url, api_key, chat_model, embedding_model)
    else:
        _llm_service.update_config(base_url, api_key, chat_model, embedding_model)
