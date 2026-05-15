from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID


class WorkflowStepCreate(BaseModel):
    name: str
    step_type: str
    config: Dict[str, Any] = {}
    order: int


class WorkflowCreate(BaseModel):
    name: str
    description: Optional[str] = None
    trigger_type: str = "manual"
    trigger_config: Dict[str, Any] = {}
    steps: List[WorkflowStepCreate] = []


class WorkflowStepResponse(BaseModel):
    id: UUID
    name: str
    step_type: str
    config: Dict[str, Any]
    order: int
    status: str
    result: Optional[Dict[str, Any]]

    class Config:
        from_attributes = True


class WorkflowResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    status: str
    trigger_type: str
    steps_count: int
    completed_steps: int
    last_run_at: Optional[datetime]
    created_at: datetime
    steps: List[WorkflowStepResponse] = []

    class Config:
        from_attributes = True
