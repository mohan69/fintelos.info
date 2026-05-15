from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID


class ConversationCreate(BaseModel):
    title: Optional[str] = None
    context: Dict[str, Any] = {}


class MessageCreate(BaseModel):
    content: str
    role: str = "user"


class MessageResponse(BaseModel):
    id: UUID
    role: str
    content: str
    extra_metadata: Dict[str, Any] = {}
    model_used: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class ConversationResponse(BaseModel):
    id: UUID
    title: Optional[str]
    context: Dict[str, Any]
    is_active: bool
    created_at: datetime
    updated_at: datetime
    messages: List[MessageResponse] = []

    class Config:
        from_attributes = True


class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[UUID] = None
    context: Dict[str, Any] = {}


class ChatResponse(BaseModel):
    conversation_id: UUID
    message: MessageResponse
    suggestions: List[str] = []
