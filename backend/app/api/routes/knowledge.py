"""Knowledge base API routes."""

import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.database import get_db, KnowledgeItem, Engagement
from app.models.schemas import KnowledgeSearchRequest, KnowledgeItemResponse, KnowledgeCreateRequest
from app.services.knowledge_service import get_knowledge_service

router = APIRouter()


@router.get("", response_model=list[KnowledgeItemResponse])
async def list_knowledge(
    category: Optional[str] = Query(None),
    agent: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    """List all knowledge items with optional filtering."""
    query = select(KnowledgeItem).order_by(KnowledgeItem.created_at.desc())
    
    if category:
        query = query.where(KnowledgeItem.category == category)
    
    query = query.offset(offset).limit(limit)
    result = await db.execute(query)
    items = result.scalars().all()
    
    # Filter by agent if specified (empty agents list means all agents)
    filtered_items = []
    for item in items:
        agents_list = item.agents or []
        if agent:
            if not agents_list or agent in agents_list:
                filtered_items.append(item)
        else:
            filtered_items.append(item)
    
    return [
        KnowledgeItemResponse(
            id=item.id,
            title=item.title,
            content=item.content,
            category=item.category,
            industry=item.industry,
            tags=item.tags or [],
            agents=item.agents or [],
            score=None,
            created_at=item.created_at.isoformat() if item.created_at else None,
        )
        for item in filtered_items
    ]


@router.post("", response_model=KnowledgeItemResponse)
async def create_knowledge_item(
    data: KnowledgeCreateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Create a new knowledge item with embedding."""
    knowledge_service = get_knowledge_service()
    
    # Generate embedding
    try:
        embedding = await knowledge_service.llm.embed(f"{data.title}\n{data.content}")
    except Exception:
        embedding = None  # Allow creation without embedding if service is unavailable
    
    item = KnowledgeItem(
        id=str(uuid.uuid4()),
        title=data.title,
        content=data.content,
        category=data.category,
        industry=data.industry,
        tags=data.tags,
        agents=data.agents,  # Empty list = applies to all agents
        embedding=embedding,
    )
    db.add(item)
    await db.flush()
    
    return KnowledgeItemResponse(
        id=item.id,
        title=item.title,
        content=item.content,
        category=item.category,
        industry=item.industry,
        tags=item.tags or [],
        agents=item.agents or [],
        score=None,
        created_at=item.created_at.isoformat() if item.created_at else None,
    )


@router.get("/{item_id}", response_model=KnowledgeItemResponse)
async def get_knowledge_item(
    item_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get a specific knowledge item by ID."""
    result = await db.execute(
        select(KnowledgeItem).where(KnowledgeItem.id == item_id)
    )
    item = result.scalar_one_or_none()
    
    if not item:
        raise HTTPException(status_code=404, detail="Knowledge item not found")
    
    return KnowledgeItemResponse(
        id=item.id,
        title=item.title,
        content=item.content,
        category=item.category,
        industry=item.industry,
        tags=item.tags or [],
        agents=item.agents or [],
        score=None,
        created_at=item.created_at.isoformat() if item.created_at else None,
    )


@router.delete("/{item_id}")
async def delete_knowledge_item(
    item_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Delete a knowledge item."""
    result = await db.execute(
        select(KnowledgeItem).where(KnowledgeItem.id == item_id)
    )
    item = result.scalar_one_or_none()
    
    if not item:
        raise HTTPException(status_code=404, detail="Knowledge item not found")
    
    await db.execute(delete(KnowledgeItem).where(KnowledgeItem.id == item_id))
    await db.flush()
    
    return {"status": "deleted", "id": item_id}


@router.put("/{item_id}", response_model=KnowledgeItemResponse)
async def update_knowledge_item(
    item_id: str,
    data: KnowledgeCreateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Update a knowledge item."""
    result = await db.execute(
        select(KnowledgeItem).where(KnowledgeItem.id == item_id)
    )
    item = result.scalar_one_or_none()
    
    if not item:
        raise HTTPException(status_code=404, detail="Knowledge item not found")
    
    # Update fields
    item.title = data.title
    item.content = data.content
    item.category = data.category
    item.industry = data.industry
    item.tags = data.tags
    item.agents = data.agents
    
    # Regenerate embedding if content changed
    knowledge_service = get_knowledge_service()
    try:
        item.embedding = await knowledge_service.llm.embed(f"{data.title}\n{data.content}")
    except Exception:
        pass  # Keep existing embedding if service unavailable
    
    await db.flush()
    
    return KnowledgeItemResponse(
        id=item.id,
        title=item.title,
        content=item.content,
        category=item.category,
        industry=item.industry,
        tags=item.tags or [],
        agents=item.agents or [],
        score=None,
        created_at=item.created_at.isoformat() if item.created_at else None,
    )


@router.post("/search", response_model=list[KnowledgeItemResponse])
async def search_knowledge(
    data: KnowledgeSearchRequest,
    db: AsyncSession = Depends(get_db),
):
    """Semantic search over knowledge base."""
    # TODO: Implement actual semantic search via Memory agent
    # For now, do basic text search
    query = select(KnowledgeItem)
    
    if data.category:
        query = query.where(KnowledgeItem.category == data.category)
    if data.industry:
        query = query.where(KnowledgeItem.industry == data.industry)
    
    result = await db.execute(query.limit(data.limit))
    items = result.scalars().all()
    
    return [
        KnowledgeItemResponse(
            id=item.id,
            title=item.title,
            content=item.content,
            category=item.category,
            industry=item.industry,
            tags=item.tags or [],
            score=1.0,  # Placeholder
        )
        for item in items
    ]


@router.post("/similar")
async def find_similar_engagements(
    query: str,
    limit: int = 5,
    db: AsyncSession = Depends(get_db),
):
    """Find similar past engagements."""
    # TODO: Implement semantic similarity search
    result = await db.execute(
        select(Engagement).limit(limit)
    )
    engagements = result.scalars().all()
    
    return [
        {
            "id": eng.id,
            "client_name": eng.client_name,
            "client_industry": eng.client_industry,
            "engagement_type": eng.engagement_type,
            "description": eng.description,
            "outcomes": eng.outcomes,
            "frameworks_used": eng.frameworks_used or [],
            "score": 0.95,  # Placeholder
        }
        for eng in engagements
    ]
