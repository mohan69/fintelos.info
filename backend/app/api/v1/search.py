from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, text
from typing import List, Optional

from app.core.database import get_db
from app.models.candidate import Candidate, CandidateEmbedding
from app.schemas.candidate import CandidateResponse
from app.services.embedding_service import embedding_service

router = APIRouter()


@router.get("/candidates", response_model=List[CandidateResponse])
async def search_candidates(
    q: str = Query(..., min_length=1),
    location: Optional[str] = None,
    skills: Optional[str] = None,
    min_experience: Optional[int] = None,
    max_experience: Optional[int] = None,
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    query = select(Candidate)

    # Text search across multiple fields
    search_filter = or_(
        Candidate.full_name.ilike(f"%{q}%"),
        Candidate.current_title.ilike(f"%{q}%"),
        Candidate.current_company.ilike(f"%{q}%"),
        Candidate.summary.ilike(f"%{q}%"),
    )
    query = query.where(search_filter)

    if location:
        query = query.where(Candidate.location.ilike(f"%{location}%"))

    if min_experience is not None:
        query = query.where(Candidate.experience_years >= min_experience)

    if max_experience is not None:
        query = query.where(Candidate.experience_years <= max_experience)

    query = query.order_by(Candidate.ai_score.desc()).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/semantic", response_model=List[CandidateResponse])
async def semantic_search(
    q: str = Query(..., min_length=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """Semantic search using AI embeddings and pgvector"""
    try:
        # Generate embedding for the search query
        query_embedding = await embedding_service.generate_embedding(q)

        # Use pgvector cosine similarity search
        # Convert embedding to string format for pgvector
        embedding_str = "[" + ",".join(str(x) for x in query_embedding) + "]"

        # Raw SQL for vector similarity search
        sql = text("""
            SELECT c.*, ce.embedding <=> :embedding::vector AS distance
            FROM candidates c
            JOIN candidate_embeddings ce ON c.id = ce.candidate_id
            WHERE ce.embedding_type = 'profile'
            ORDER BY ce.embedding <=> :embedding::vector
            LIMIT :limit
        """)

        result = await db.execute(sql, {"embedding": embedding_str, "limit": limit})
        rows = result.fetchall()

        # Convert rows to Candidate objects
        candidates = []
        for row in rows:
            candidate = Candidate(
                id=row.id,
                full_name=row.full_name,
                email=row.email,
                current_title=row.current_title,
                current_company=row.current_company,
                location=row.location,
                skills=row.skills,
                experience_years=row.experience_years,
                ai_score=row.ai_score,
                job_stability_score=row.job_stability_score,
                response_likelihood=row.response_likelihood,
                status=row.status,
                tags=row.tags,
                created_at=row.created_at,
            )
            candidates.append(candidate)

        return candidates

    except Exception as e:
        # Fallback to text search if embeddings fail
        query = select(Candidate).where(
            or_(
                Candidate.full_name.ilike(f"%{q}%"),
                Candidate.current_title.ilike(f"%{q}%"),
                Candidate.skills.cast(str).ilike(f"%{q}%"),
            )
        ).order_by(Candidate.ai_score.desc()).limit(limit)

        result = await db.execute(query)
        return result.scalars().all()
