"""Debug Logging API - Enterprise debugging and feedback system."""

import uuid
from datetime import datetime, timedelta
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import select, func, desc, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.database import get_db, DebugLog, Conversation


router = APIRouter(prefix="/api/debug", tags=["debug"])


# ============ Schemas ============

class DebugLogCreate(BaseModel):
    """Create a debug log entry."""
    conversation_id: Optional[str] = None
    prompt: str
    completion: Optional[str] = None
    duration_ms: Optional[int] = None
    tokens_prompt: int = 0
    tokens_completion: int = 0
    agents_used: List[str] = []
    tools_called: List[dict] = []
    intent_detected: Optional[str] = None
    entities_extracted: List[str] = []
    model_used: Optional[str] = None
    provider: Optional[str] = None
    status: str = "success"
    error_message: Optional[str] = None
    metadata: dict = {}


class DebugLogResponse(BaseModel):
    """Debug log response."""
    id: str
    request_id: str
    conversation_id: Optional[str]
    prompt: str
    completion: Optional[str]
    duration_ms: Optional[int]
    tokens_prompt: int
    tokens_completion: int
    tokens_total: int
    agents_used: List[str]
    tools_called: List[dict]
    intent_detected: Optional[str]
    entities_extracted: List[str]
    model_used: Optional[str]
    provider: Optional[str]
    status: str
    error_message: Optional[str]
    feedback_rating: Optional[int]
    feedback_comment: Optional[str]
    feedback_at: Optional[datetime]
    created_at: datetime
    metadata: dict


class FeedbackSubmit(BaseModel):
    """Submit feedback for a log entry."""
    rating: int  # 1 = thumbs down, 2 = thumbs up
    comment: Optional[str] = None


class DebugStats(BaseModel):
    """Debug dashboard statistics."""
    total_requests: int
    success_count: int
    error_count: int
    avg_duration_ms: float
    total_tokens: int
    feedback_positive: int
    feedback_negative: int
    feedback_pending: int
    requests_today: int
    requests_this_week: int


# ============ API Endpoints ============

@router.post("/logs", response_model=DebugLogResponse)
async def create_debug_log(
    data: DebugLogCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create a new debug log entry."""
    request_id = f"req_{uuid.uuid4().hex[:12]}"
    
    log = DebugLog(
        id=str(uuid.uuid4()),
        request_id=request_id,
        conversation_id=data.conversation_id,
        prompt=data.prompt,
        completion=data.completion,
        duration_ms=data.duration_ms,
        tokens_prompt=data.tokens_prompt,
        tokens_completion=data.tokens_completion,
        tokens_total=data.tokens_prompt + data.tokens_completion,
        agents_used=data.agents_used,
        tools_called=data.tools_called,
        intent_detected=data.intent_detected,
        entities_extracted=data.entities_extracted,
        model_used=data.model_used,
        provider=data.provider,
        status=data.status,
        error_message=data.error_message,
        metadata_=data.metadata,
    )
    
    db.add(log)
    await db.flush()
    
    return _log_to_response(log)


@router.get("/logs", response_model=List[DebugLogResponse])
async def list_debug_logs(
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
    status: Optional[str] = None,
    has_feedback: Optional[bool] = None,
    rating: Optional[int] = None,
    search: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: AsyncSession = Depends(get_db),
):
    """List debug logs with filtering."""
    query = select(DebugLog).order_by(desc(DebugLog.created_at))
    
    # Apply filters
    conditions = []
    
    if status:
        conditions.append(DebugLog.status == status)
    
    if has_feedback is not None:
        if has_feedback:
            conditions.append(DebugLog.feedback_rating.isnot(None))
        else:
            conditions.append(DebugLog.feedback_rating.is_(None))
    
    if rating is not None:
        conditions.append(DebugLog.feedback_rating == rating)
    
    if search:
        search_pattern = f"%{search}%"
        conditions.append(
            (DebugLog.prompt.ilike(search_pattern)) |
            (DebugLog.completion.ilike(search_pattern)) |
            (DebugLog.request_id.ilike(search_pattern))
        )
    
    if start_date:
        conditions.append(DebugLog.created_at >= start_date)
    
    if end_date:
        conditions.append(DebugLog.created_at <= end_date)
    
    if conditions:
        query = query.where(and_(*conditions))
    
    query = query.offset(offset).limit(limit)
    
    result = await db.execute(query)
    logs = result.scalars().all()
    
    return [_log_to_response(log) for log in logs]


@router.get("/logs/{log_id}", response_model=DebugLogResponse)
async def get_debug_log(
    log_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get a specific debug log by ID or request_id."""
    # Try by ID first
    result = await db.execute(
        select(DebugLog).where(
            (DebugLog.id == log_id) | (DebugLog.request_id == log_id)
        )
    )
    log = result.scalar_one_or_none()
    
    if not log:
        raise HTTPException(status_code=404, detail="Debug log not found")
    
    return _log_to_response(log)


@router.post("/logs/{log_id}/feedback", response_model=DebugLogResponse)
async def submit_feedback(
    log_id: str,
    data: FeedbackSubmit,
    db: AsyncSession = Depends(get_db),
):
    """Submit feedback for a debug log entry."""
    result = await db.execute(
        select(DebugLog).where(
            (DebugLog.id == log_id) | (DebugLog.request_id == log_id)
        )
    )
    log = result.scalar_one_or_none()
    
    if not log:
        raise HTTPException(status_code=404, detail="Debug log not found")
    
    if data.rating not in [1, 2]:
        raise HTTPException(status_code=400, detail="Rating must be 1 (thumbs down) or 2 (thumbs up)")
    
    log.feedback_rating = data.rating
    log.feedback_comment = data.comment
    log.feedback_at = datetime.utcnow()
    
    await db.flush()
    
    return _log_to_response(log)


@router.get("/stats", response_model=DebugStats)
async def get_debug_stats(
    db: AsyncSession = Depends(get_db),
):
    """Get debug dashboard statistics."""
    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - timedelta(days=7)
    
    # Total counts
    total_result = await db.execute(select(func.count(DebugLog.id)))
    total_requests = total_result.scalar() or 0
    
    # Success/Error counts
    success_result = await db.execute(
        select(func.count(DebugLog.id)).where(DebugLog.status == "success")
    )
    success_count = success_result.scalar() or 0
    
    error_result = await db.execute(
        select(func.count(DebugLog.id)).where(DebugLog.status == "error")
    )
    error_count = error_result.scalar() or 0
    
    # Average duration
    avg_result = await db.execute(
        select(func.avg(DebugLog.duration_ms)).where(DebugLog.duration_ms.isnot(None))
    )
    avg_duration = avg_result.scalar() or 0
    
    # Total tokens
    tokens_result = await db.execute(select(func.sum(DebugLog.tokens_total)))
    total_tokens = tokens_result.scalar() or 0
    
    # Feedback counts
    positive_result = await db.execute(
        select(func.count(DebugLog.id)).where(DebugLog.feedback_rating == 2)
    )
    feedback_positive = positive_result.scalar() or 0
    
    negative_result = await db.execute(
        select(func.count(DebugLog.id)).where(DebugLog.feedback_rating == 1)
    )
    feedback_negative = negative_result.scalar() or 0
    
    pending_result = await db.execute(
        select(func.count(DebugLog.id)).where(DebugLog.feedback_rating.is_(None))
    )
    feedback_pending = pending_result.scalar() or 0
    
    # Requests today
    today_result = await db.execute(
        select(func.count(DebugLog.id)).where(DebugLog.created_at >= today_start)
    )
    requests_today = today_result.scalar() or 0
    
    # Requests this week
    week_result = await db.execute(
        select(func.count(DebugLog.id)).where(DebugLog.created_at >= week_start)
    )
    requests_this_week = week_result.scalar() or 0
    
    return DebugStats(
        total_requests=total_requests,
        success_count=success_count,
        error_count=error_count,
        avg_duration_ms=round(avg_duration, 2),
        total_tokens=total_tokens,
        feedback_positive=feedback_positive,
        feedback_negative=feedback_negative,
        feedback_pending=feedback_pending,
        requests_today=requests_today,
        requests_this_week=requests_this_week,
    )


@router.delete("/logs/{log_id}")
async def delete_debug_log(
    log_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Delete a debug log entry."""
    result = await db.execute(
        select(DebugLog).where(
            (DebugLog.id == log_id) | (DebugLog.request_id == log_id)
        )
    )
    log = result.scalar_one_or_none()
    
    if not log:
        raise HTTPException(status_code=404, detail="Debug log not found")
    
    await db.delete(log)
    
    return {"message": "Log deleted successfully"}


@router.delete("/logs")
async def clear_debug_logs(
    older_than_days: int = Query(30, ge=1),
    db: AsyncSession = Depends(get_db),
):
    """Clear debug logs older than specified days."""
    cutoff = datetime.utcnow() - timedelta(days=older_than_days)
    
    result = await db.execute(
        select(DebugLog).where(DebugLog.created_at < cutoff)
    )
    logs = result.scalars().all()
    
    count = len(logs)
    for log in logs:
        await db.delete(log)
    
    return {"message": f"Deleted {count} logs older than {older_than_days} days"}


# ============ Helper Functions ============

def _log_to_response(log: DebugLog) -> DebugLogResponse:
    """Convert DebugLog model to response."""
    return DebugLogResponse(
        id=log.id,
        request_id=log.request_id,
        conversation_id=log.conversation_id,
        prompt=log.prompt,
        completion=log.completion,
        duration_ms=log.duration_ms,
        tokens_prompt=log.tokens_prompt,
        tokens_completion=log.tokens_completion,
        tokens_total=log.tokens_total,
        agents_used=log.agents_used or [],
        tools_called=log.tools_called or [],
        intent_detected=log.intent_detected,
        entities_extracted=log.entities_extracted or [],
        model_used=log.model_used,
        provider=log.provider,
        status=log.status,
        error_message=log.error_message,
        feedback_rating=log.feedback_rating,
        feedback_comment=log.feedback_comment,
        feedback_at=log.feedback_at,
        created_at=log.created_at,
        metadata=log.metadata_ or {},
    )
