from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.candidates import router as candidates_router
from app.api.v1.conversations import router as conversations_router
from app.api.v1.workflows import router as workflows_router
from app.api.v1.search import router as search_router
from app.api.v1.memory import router as memory_router
from app.api.v1.chat import router as chat_router

router = APIRouter()

router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
router.include_router(candidates_router, prefix="/candidates", tags=["Candidates"])
router.include_router(conversations_router, prefix="/conversations", tags=["Conversations"])
router.include_router(workflows_router, prefix="/workflows", tags=["Workflows"])
router.include_router(search_router, prefix="/search", tags=["Search"])
router.include_router(memory_router, prefix="/memory", tags=["Memory"])
router.include_router(chat_router, prefix="/chat", tags=["AI Chat"])
