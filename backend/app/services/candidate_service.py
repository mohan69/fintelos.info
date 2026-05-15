from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from uuid import UUID

from app.models.candidate import Candidate, CandidateEmbedding
from app.services.embedding_service import embedding_service


class CandidateService:
    """Service for candidate operations"""

    async def create_candidate(self, db: AsyncSession, candidate_data: dict) -> Candidate:
        candidate = Candidate(**candidate_data)
        db.add(candidate)
        await db.flush()

        # Generate embedding for candidate profile
        profile_text = f"{candidate.full_name} {candidate.current_title or ''} {candidate.current_company or ''} {candidate.summary or ''}"
        embedding = await embedding_service.generate_embedding(profile_text)

        candidate_embedding = CandidateEmbedding(
            candidate_id=candidate.id,
            embedding_type="profile",
            embedding=embedding,
        )
        db.add(candidate_embedding)
        await db.commit()
        await db.refresh(candidate)
        return candidate

    async def search_candidates_semantic(
        self, db: AsyncSession, query_embedding: List[float], limit: int = 20
    ) -> List[Candidate]:
        """Semantic search using cosine similarity"""
        result = await db.execute(select(Candidate))
        candidates = result.scalars().all()

        # Calculate similarities and sort
        scored = []
        for candidate in candidates:
            emb_result = await db.execute(
                select(CandidateEmbedding)
                .where(CandidateEmbedding.candidate_id == candidate.id)
                .where(CandidateEmbedding.embedding_type == "profile")
            )
            emb = emb_result.scalar_one_or_none()
            if emb:
                similarity = embedding_service.cosine_similarity(query_embedding, emb.embedding)
                scored.append((candidate, similarity))

        scored.sort(key=lambda x: x[1], reverse=True)
        return [c for c, _ in scored[:limit]]

    async def get_candidate_by_id(self, db: AsyncSession, candidate_id: UUID) -> Optional[Candidate]:
        result = await db.execute(select(Candidate).where(Candidate.id == candidate_id))
        return result.scalar_one_or_none()


candidate_service = CandidateService()
