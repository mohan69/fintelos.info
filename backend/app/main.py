from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import init_db
from app.core.websocket import websocket_endpoint
from app.api.v1 import router as api_v1_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title="Fintelos",
    description="AI-Native Talent Intelligence & Autonomous Recruiting Operating System",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_v1_router, prefix="/api/v1")


@app.get("/health")
async def health():
    return {"status": "healthy", "service": "fintelos"}


@app.get("/")
async def root():
    return {
        "name": "Fintelos",
        "version": "0.1.0",
        "description": "AI-Native Talent Intelligence & Autonomous Recruiting Operating System",
    }


@app.websocket("/ws/{channel}")
async def websocket_route(websocket: WebSocket, channel: str):
    await websocket_endpoint(websocket, channel)
