#!/usr/bin/env python3
"""Test script to verify all imports work correctly"""
import sys
sys.path.insert(0, '.')

try:
    print("Testing imports...")

    from app.core.config import settings
    print("✓ app.core.config")

    from app.core.database import Base, engine, AsyncSessionLocal, get_db, init_db
    print("✓ app.core.database")

    from app.core.security import verify_password, get_password_hash, create_access_token, decode_access_token
    print("✓ app.core.security")

    from app.core.redis import redis_client, get_redis, cache_set, cache_get, cache_delete, publish_event
    print("✓ app.core.redis")

    from app.core.websocket import ConnectionManager, manager, websocket_endpoint
    print("✓ app.core.websocket")

    from app.core.celery import celery_app
    print("✓ app.core.celery")

    from app.models import User, Candidate, CandidateEmbedding, Conversation, Message, Workflow, WorkflowStep, RecruiterMemory
    print("✓ app.models")

    from app.schemas import UserCreate, UserLogin, UserResponse, Token, CandidateCreate, CandidateUpdate, CandidateResponse, CandidateSearch
    print("✓ app.schemas (part 1)")

    from app.schemas import ConversationCreate, MessageCreate, ConversationResponse, MessageResponse, ChatRequest, WorkflowCreate, WorkflowResponse
    print("✓ app.schemas (part 2)")

    from app.services.embedding_service import embedding_service
    print("✓ app.services.embedding_service")

    from app.services.candidate_service import candidate_service
    print("✓ app.services.candidate_service")

    from app.api.v1.auth import router as auth_router
    print("✓ app.api.v1.auth")

    from app.api.v1.candidates import router as candidates_router
    print("✓ app.api.v1.candidates")

    from app.api.v1.conversations import router as conversations_router
    print("✓ app.api.v1.conversations")

    from app.api.v1.workflows import router as workflows_router
    print("✓ app.api.v1.workflows")

    from app.api.v1.search import router as search_router
    print("✓ app.api.v1.search")

    from app.api.v1.memory import router as memory_router
    print("✓ app.api.v1.memory")

    from app.api.v1.chat import router as chat_router
    print("✓ app.api.v1.chat")

    from app.api.v1 import router as api_v1_router
    print("✓ app.api.v1")

    from app.main import app
    print("✓ app.main")

    print("\n✅ All imports successful!")
    print(f"\nApp routes:")
    for route in app.routes:
        if hasattr(route, 'path'):
            methods = getattr(route, 'methods', set())
            print(f"  {methods or 'WS'} {route.path}")

except ImportError as e:
    print(f"\n❌ Import error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
except Exception as e:
    print(f"\n❌ Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
