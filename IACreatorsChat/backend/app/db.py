from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from .settings import settings

engine = create_async_engine(settings.DATABASE_URL, echo=False, future=True)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

class Base(DeclarativeBase):
    pass

async def get_session():
    async with SessionLocal() as session:
        yield session

async def init_db():
    from .models import User, Session, Conversation, Message
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
