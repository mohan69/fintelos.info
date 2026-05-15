from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from typing import List, Optional
from uuid import UUID

from app.core.database import get_db
from app.models.candidate import Candidate, CandidateEmbedding
from app.schemas.candidate import CandidateCreate, CandidateUpdate, CandidateResponse
from app.services.embedding_service import embedding_service

router = APIRouter()


@router.get("/", response_model=List[CandidateResponse])
async def list_candidates(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    query = select(Candidate)
    if status:
        query = query.where(Candidate.status == status)
    query = query.offset(skip).limit(limit).order_by(Candidate.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/", response_model=CandidateResponse)
async def create_candidate(candidate_data: CandidateCreate, db: AsyncSession = Depends(get_db)):
    candidate = Candidate(**candidate_data.model_dump())
    db.add(candidate)
    await db.flush()

    # Generate embedding for candidate profile
    try:
        profile_text = build_profile_text(candidate)
        embedding = await embedding_service.generate_embedding(profile_text)

        candidate_embedding = CandidateEmbedding(
            candidate_id=candidate.id,
            embedding_type="profile",
            embedding=embedding,
        )
        db.add(candidate_embedding)
    except Exception as e:
        # Continue without embedding if AI service fails
        pass

    await db.commit()
    await db.refresh(candidate)
    return candidate


@router.get("/{candidate_id}", response_model=CandidateResponse)
async def get_candidate(candidate_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Candidate).where(Candidate.id == candidate_id))
    candidate = result.scalar_one_or_none()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return candidate


@router.patch("/{candidate_id}", response_model=CandidateResponse)
async def update_candidate(candidate_id: UUID, update_data: CandidateUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Candidate).where(Candidate.id == candidate_id))
    candidate = result.scalar_one_or_none()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    for field, value in update_data.model_dump(exclude_unset=True).items():
        setattr(candidate, field, value)

    # Update embedding if profile changed
    try:
        profile_text = build_profile_text(candidate)
        embedding = await embedding_service.generate_embedding(profile_text)

        # Update or create embedding
        emb_result = await db.execute(
            select(CandidateEmbedding)
            .where(CandidateEmbedding.candidate_id == candidate.id)
            .where(CandidateEmbedding.embedding_type == "profile")
        )
        existing_emb = emb_result.scalar_one_or_none()

        if existing_emb:
            existing_emb.embedding = embedding
        else:
            new_emb = CandidateEmbedding(
                candidate_id=candidate.id,
                embedding_type="profile",
                embedding=embedding,
            )
            db.add(new_emb)
    except Exception:
        pass

    await db.commit()
    await db.refresh(candidate)
    return candidate


@router.delete("/{candidate_id}")
async def delete_candidate(candidate_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Candidate).where(Candidate.id == candidate_id))
    candidate = result.scalar_one_or_none()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    await db.delete(candidate)
    await db.commit()
    return {"message": "Candidate deleted"}


def build_profile_text(candidate: Candidate) -> str:
    """Build text representation of candidate for embedding"""
    parts = [candidate.full_name]
    if candidate.current_title:
        parts.append(candidate.current_title)
    if candidate.current_company:
        parts.append(f"at {candidate.current_company}")
    if candidate.summary:
        parts.append(candidate.summary)
    if candidate.skills:
        parts.append(f"Skills: {', '.join(candidate.skills)}")
    if candidate.location:
        parts.append(f"Location: {candidate.location}")
    return " ".join(parts)
