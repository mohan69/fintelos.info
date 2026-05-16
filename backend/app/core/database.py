from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings


database_url = settings.DATABASE_URL.replace(
    "postgresql://",
    "postgresql+asyncpg://"
).replace(
    "postgresql+psycopg2://",
    "postgresql+asyncpg://"
)

engine = create_async_engine(
    database_url,
    echo=settings.DEBUG,
    pool_size=20,
    max_overflow=10
)

AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    async with engine.begin() as conn:

        # Enable pgvector extension
        await conn.exec_driver_sql(
            'CREATE EXTENSION IF NOT EXISTS vector'
        )

        # Create tables
        await conn.run_sync(Base.metadata.create_all)
