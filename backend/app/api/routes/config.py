"""Configuration API routes for dynamic LLM settings."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/api/config", tags=["config"])


class LLMConfigRequest(BaseModel):
    """LLM configuration update request."""
    provider: str  # ollama, openai, azure
    base_url: str
    api_key: str
    chat_model: str
    embedding_model: str


class LLMConfigResponse(BaseModel):
    """LLM configuration response."""
    provider: str
    base_url: str
    chat_model: str
    embedding_model: str
    is_local: bool


class AgentConfigRequest(BaseModel):
    """Per-agent configuration update request."""
    agent_id: str
    llm_provider_id: Optional[str] = None
    llm_model: Optional[str] = None
    temperature: Optional[float] = None
    max_tokens: Optional[int] = None
    system_prompt_override: Optional[str] = None  # None = use default, empty string = use default


class AgentConfigResponse(BaseModel):
    """Per-agent configuration response."""
    agent_id: str
    llm_model: Optional[str]
    temperature: float
    max_tokens: int
    system_prompt: Optional[str]  # Custom prompt if set


# In-memory config store (in production, use database or env reload)
_current_llm_config: Optional[LLMConfigRequest] = None
_agent_configs: dict[str, AgentConfigRequest] = {}


@router.post("/llm", response_model=dict)
async def update_llm_config(config: LLMConfigRequest):
    """Update the LLM configuration dynamically."""
    global _current_llm_config
    
    # Store the new config
    _current_llm_config = config
    
    # Update the LLM service with new config
    from app.services.llm_service import update_llm_config as service_update
    
    try:
        await service_update(
            base_url=config.base_url,
            api_key=config.api_key,
            chat_model=config.chat_model,
            embedding_model=config.embedding_model,
        )
        
        return {
            "status": "success",
            "message": f"LLM configuration updated to {config.provider}",
            "config": {
                "provider": config.provider,
                "chat_model": config.chat_model,
                "embedding_model": config.embedding_model,
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update LLM config: {str(e)}")


@router.get("/llm", response_model=LLMConfigResponse)
async def get_llm_config():
    """Get the current LLM configuration."""
    from app.config import settings
    
    if _current_llm_config:
        return LLMConfigResponse(
            provider=_current_llm_config.provider,
            base_url=_current_llm_config.base_url,
            chat_model=_current_llm_config.chat_model,
            embedding_model=_current_llm_config.embedding_model,
            is_local="localhost" in _current_llm_config.base_url or "127.0.0.1" in _current_llm_config.base_url,
        )
    
    # Return default config from settings
    return LLMConfigResponse(
        provider="ollama",
        base_url=settings.ollama_base_url,
        chat_model=settings.llm_chat_model,
        embedding_model=settings.llm_embedding_model,
        is_local=True,
    )


@router.post("/agent", response_model=dict)
async def update_agent_config(config: AgentConfigRequest):
    """Update per-agent LLM configuration."""
    global _agent_configs
    
    # Store the agent config
    _agent_configs[config.agent_id] = config
    
    return {
        "status": "success",
        "message": f"Agent {config.agent_id} configuration updated",
        "config": {
            "agent_id": config.agent_id,
            "llm_model": config.llm_model,
            "temperature": config.temperature,
            "max_tokens": config.max_tokens,
        }
    }


@router.get("/agent/{agent_id}", response_model=AgentConfigResponse)
async def get_agent_config(agent_id: str):
    """Get per-agent LLM configuration."""
    if agent_id in _agent_configs:
        cfg = _agent_configs[agent_id]
        return AgentConfigResponse(
            agent_id=agent_id,
            llm_model=cfg.llm_model,
            temperature=cfg.temperature or 0.7,
            max_tokens=cfg.max_tokens or 2048,
            system_prompt=cfg.system_prompt_override,
        )
    
    # Return defaults
    return AgentConfigResponse(
        agent_id=agent_id,
        llm_model=None,
        temperature=0.7,
        max_tokens=2048,
        system_prompt=None,
    )


@router.get("/agents", response_model=dict)
async def get_all_agent_configs():
    """Get all per-agent LLM configurations."""
    return {
        "agents": {
            agent_id: {
                "llm_model": cfg.llm_model,
                "temperature": cfg.temperature,
                "max_tokens": cfg.max_tokens,
            }
            for agent_id, cfg in _agent_configs.items()
        }
    }


def get_agent_llm_config(agent_id: str) -> tuple[Optional[str], float, int, Optional[str]]:
    """
    Get LLM configuration for a specific agent.
    Returns (model_name, temperature, max_tokens, system_prompt_override)
    """
    if agent_id in _agent_configs:
        cfg = _agent_configs[agent_id]
        return (
            cfg.llm_model,
            cfg.temperature or 0.7,
            cfg.max_tokens or 2048,
            cfg.system_prompt_override,
        )
    return (None, 0.7, 2048, None)


@router.get("/prompts", response_model=dict)
async def get_default_prompts():
    """Get default system prompts for all agents."""
    from app.agents.prompts import AGENT_PROMPTS
    return {"prompts": AGENT_PROMPTS}


@router.get("/prompts/{agent_id}", response_model=dict)
async def get_agent_prompt(agent_id: str):
    """Get default system prompt for a specific agent."""
    from app.agents.prompts import AGENT_PROMPTS
    if agent_id not in AGENT_PROMPTS:
        raise HTTPException(status_code=404, detail=f"Agent {agent_id} not found")
    return {"agent_id": agent_id, "prompt": AGENT_PROMPTS[agent_id]}
