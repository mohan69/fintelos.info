from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List
from uuid import UUID

from app.core.database import get_db
from app.models.workflow import Workflow, WorkflowStep
from app.schemas.workflow import WorkflowCreate, WorkflowResponse

router = APIRouter()


@router.get("/", response_model=List[WorkflowResponse])
async def list_workflows(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    query = select(Workflow).options(selectinload(Workflow.steps)).offset(skip).limit(limit).order_by(Workflow.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/", response_model=WorkflowResponse)
async def create_workflow(workflow_data: WorkflowCreate, db: AsyncSession = Depends(get_db)):
    workflow = Workflow(
        name=workflow_data.name,
        description=workflow_data.description,
        trigger_type=workflow_data.trigger_type,
        trigger_config=workflow_data.trigger_config,
        steps_count=len(workflow_data.steps),
    )
    db.add(workflow)
    await db.flush()

    for step_data in workflow_data.steps:
        step = WorkflowStep(
            workflow_id=workflow.id,
            name=step_data.name,
            step_type=step_data.step_type,
            config=step_data.config,
            order=step_data.order,
        )
        db.add(step)

    await db.commit()

    # Re-fetch with steps loaded
    query = select(Workflow).options(selectinload(Workflow.steps)).where(Workflow.id == workflow.id)
    result = await db.execute(query)
    workflow = result.scalar_one()
    return workflow


@router.get("/{workflow_id}", response_model=WorkflowResponse)
async def get_workflow(workflow_id: UUID, db: AsyncSession = Depends(get_db)):
    query = select(Workflow).options(selectinload(Workflow.steps)).where(Workflow.id == workflow_id)
    result = await db.execute(query)
    workflow = result.scalar_one_or_none()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return workflow
