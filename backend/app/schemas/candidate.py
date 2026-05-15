from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class CandidateCreate(BaseModel):
    full_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    current_title: Optional[str] = None
    current_company: Optional[str] = None
    location: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    summary: Optional[str] = None
    skills: List[str] = []
    experience_years: Optional[int] = None
    education: List[dict] = []
    work_history: List[dict] = []


class CandidateUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    current_title: Optional[str] = None
    current_company: Optional[str] = None
    location: Optional[str] = None
    status: Optional[str] = None
    tags: Optional[List[str]] = None
    notes: Optional[str] = None


class CandidateResponse(BaseModel):
    id: UUID
    full_name: str
    email: Optional[str]
    current_title: Optional[str]
    current_company: Optional[str]
    location: Optional[str]
    skills: List[str]
    experience_years: Optional[int]
    ai_score: float
    job_stability_score: float
    response_likelihood: float
    status: str
    tags: List[str]
    created_at: datetime

    class Config:
        from_attributes = True


class CandidateSearch(BaseModel):
    query: str
    location: Optional[str] = None
    skills: List[str] = []
    min_experience: Optional[int] = None
    max_experience: Optional[int] = None
    status: Optional[str] = None
    limit: int = 20
    offset: int = 0
