from sqlalchemy import Column, String, Text, DateTime, Float, Integer, JSON, Boolean
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from pgvector.sqlalchemy import Vector
from datetime import datetime
import uuid

from app.core.database import Base
from app.core.config import settings


class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name = Column(String(255), nullable=False, index=True)
    email = Column(String(255), unique=True, index=True)
    phone = Column(String(50))
    current_title = Column(String(255))
    current_company = Column(String(255))
    location = Column(String(255))
    linkedin_url = Column(String(500))
    github_url = Column(String(500))
    portfolio_url = Column(String(500))

    # Profile
    summary = Column(Text)
    skills = Column(JSON, default=list)
    experience_years = Column(Integer)
    education = Column(JSON, default=list)
    work_history = Column(JSON, default=list)
    certifications = Column(JSON, default=list)

    # Intelligence
    ai_score = Column(Float, default=0.0)
    job_stability_score = Column(Float, default=0.0)
    response_likelihood = Column(Float, default=0.0)
    skill_match_score = Column(Float, default=0.0)
    availability_status = Column(String(50))

    # Status
    status = Column(String(50), default="new")
    source = Column(String(100))
    tags = Column(JSON, default=list)
    notes = Column(Text)

    # Metadata
    is_passive = Column(Boolean, default=False)
    salary_expectation = Column(String(100))
    notice_period = Column(String(50))

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class CandidateEmbedding(Base):
    __tablename__ = "candidate_embeddings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    candidate_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    embedding_type = Column(String(50), nullable=False)  # profile, skills, experience, resume
    embedding = Column(Vector(settings.EMBEDDING_DIMENSIONS))
    content_hash = Column(String(64))
    created_at = Column(DateTime, default=datetime.utcnow)
