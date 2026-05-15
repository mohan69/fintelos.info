from sqlalchemy import Column, String, Text, DateTime, JSON, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.core.database import Base


class RecruiterMemory(Base):
    __tablename__ = "recruiter_memories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True, index=True)
    memory_type = Column(String(100), nullable=False)  # preference, insight, pattern, context
    category = Column(String(100))  # sourcing, outreach, candidates, workflow
    content = Column(Text, nullable=False)
    context = Column(JSON, default=dict)
    importance = Column(String(50), default="normal")  # low, normal, high, critical
    is_active = Column(Boolean, default=True)
    last_accessed = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="memories")
