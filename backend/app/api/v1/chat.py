from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from uuid import UUID
import json

from app.core.database import get_db
from app.models.conversation import Conversation, Message
from app.models.candidate import Candidate
from app.models.memory import RecruiterMemory
from app.schemas.conversation import ChatRequest, ChatResponse, MessageResponse
from app.ai.orchestrator import orchestrator, AIMessage

router = APIRouter()


@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest, db: AsyncSession = Depends(get_db)):
    """Process chat message and return AI response"""
    # Get or create conversation
    if request.conversation_id:
        result = await db.execute(
            select(Conversation)
            .options(selectinload(Conversation.messages))
            .where(Conversation.id == request.conversation_id)
        )
        conversation = result.scalar_one_or_none()
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
    else:
        conversation = Conversation(
            title=request.message[:100],
            context=request.context,
        )
        db.add(conversation)
        await db.flush()

    # Save user message
    user_message = Message(
        conversation_id=conversation.id,
        role="user",
        content=request.message,
    )
    db.add(user_message)
    await db.flush()

    # Build conversation history
    history = []
    for msg in conversation.messages:
        history.append(AIMessage(role=msg.role, content=msg.content))
    history.append(AIMessage(role="user", content=request.message))

    # Get context from database
    context = await build_context(db, request.message, request.context)

    # Generate AI response
    try:
        ai_response = await orchestrator.chat(
            user_message=request.message,
            conversation_history=history[:-1],
            context=context,
        )
        ai_content = ai_response.content
        model_used = ai_response.model
    except Exception as e:
        ai_content = f"I encountered an error processing your request: {str(e)}. Please check that your AI provider API key is configured."
        model_used = "error"

    # Save AI message
    ai_message = Message(
        conversation_id=conversation.id,
        role="assistant",
        content=ai_content,
        model_used=model_used,
    )
    db.add(ai_message)
    await db.commit()
    await db.refresh(ai_message)

    # Generate contextual suggestions
    suggestions = generate_suggestions(request.message, context)

    return ChatResponse(
        conversation_id=conversation.id,
        message=MessageResponse.model_validate(ai_message),
        suggestions=suggestions,
    )


@router.post("/stream")
async def chat_stream(request: ChatRequest, db: AsyncSession = Depends(get_db)):
    """Stream AI response using Server-Sent Events"""
    # Get or create conversation
    if request.conversation_id:
        result = await db.execute(
            select(Conversation)
            .options(selectinload(Conversation.messages))
            .where(Conversation.id == request.conversation_id)
        )
        conversation = result.scalar_one_or_none()
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
    else:
        conversation = Conversation(
            title=request.message[:100],
            context=request.context,
        )
        db.add(conversation)
        await db.flush()

    # Save user message
    user_message = Message(
        conversation_id=conversation.id,
        role="user",
        content=request.message,
    )
    db.add(user_message)
    await db.flush()

    # Build conversation history
    history = []
    for msg in conversation.messages:
        history.append(AIMessage(role=msg.role, content=msg.content))

    # Get context
    context = await build_context(db, request.message, request.context)

    async def generate():
        full_response = ""
        try:
            async for chunk in orchestrator.chat_stream(
                user_message=request.message,
                conversation_history=history,
                context=context,
            ):
                full_response += chunk
                yield f"data: {json.dumps({'content': chunk, 'done': False})}\n\n"

            # Save the complete response
            ai_message = Message(
                conversation_id=conversation.id,
                role="assistant",
                content=full_response,
                model_used="gpt-4o-mini",
            )
            db.add(ai_message)
            await db.commit()

            yield f"data: {json.dumps({'content': '', 'done': True, 'conversation_id': str(conversation.id), 'message_id': str(ai_message.id)})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e), 'done': True})}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


async def build_context(db: AsyncSession, message: str, extra_context: dict) -> dict:
    """Build context from database for AI"""
    context = {}

    # Get relevant candidates
    candidate_result = await db.execute(
        select(Candidate)
        .order_by(Candidate.ai_score.desc())
        .limit(10)
    )
    candidates = candidate_result.scalars().all()
    if candidates:
        context["candidates"] = [
            {
                "full_name": c.full_name,
                "current_title": c.current_title,
                "current_company": c.current_company,
                "skills": c.skills or [],
                "location": c.location,
                "experience_years": c.experience_years,
            }
            for c in candidates
        ]

    # Get recruiter memories
    memory_result = await db.execute(
        select(RecruiterMemory)
        .where(RecruiterMemory.is_active == True)
        .order_by(RecruiterMemory.created_at.desc())
        .limit(5)
    )
    memories = memory_result.scalars().all()
    if memories:
        context["memories"] = [m.content for m in memories]

    return context


def generate_suggestions(message: str, context: dict) -> list:
    """Generate contextual follow-up suggestions"""
    suggestions = []

    if context.get("candidates"):
        suggestions.append("Show me more details about these candidates")
        suggestions.append("Generate outreach for the top candidates")

    suggestions.append("Find similar candidates")
    suggestions.append("Create a sourcing workflow")

    return suggestions[:4]
