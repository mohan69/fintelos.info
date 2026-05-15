from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from uuid import UUID

from app.core.database import get_db
from app.models.memory import RecruiterMemory
from pydantic import BaseModel
from datetime import datetime


class MemoryCreate(BaseModel):
    memory_type: str
    category: Optional[str] = None
    content: str
    context: dict = {}
    importance: str = "normal"


class MemoryResponse(BaseModel):
    id: UUID
    memory_type: str
    category: Optional[str]
    content: str
    context: dict
    importance: str
    created_at: datetime

    class Config:
        from_attributes = True


router = APIRouter()


@router.get("/", response_model=List[MemoryResponse])
async def list_memories(
    memory_type: Optional[str] = None,
    category: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
):
    query = select(RecruiterMemory).where(RecruiterMemory.is_active == True)
    if memory_type:
        query = query.where(RecruiterMemory.memory_type == memory_type)
    if category:
        query = query.where(RecruiterMemory.category == category)
    query = query.order_by(RecruiterMemory.created_at.desc()).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/", response_model=MemoryResponse)
async def create_memory(memory_data: MemoryCreate, db: AsyncSession = Depends(get_db)):
    memory = RecruiterMemory(**memory_data.model_dump())
    db.add(memory)
    await db.commit()
    await db.refresh(memory)
    return memory


@router.delete("/{memory_id}")
async def delete_memory(memory_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(RecruiterMemory).where(RecruiterMemory.id == memory_id))
    memory = result.scalar_one_or_none()
    if not memory:
        raise HTTPException(status_code=404, detail="Memory not found")
    memory.is_active = False
    await db.commit()
    return {"message": "Memory archived"}
