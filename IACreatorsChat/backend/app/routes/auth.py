from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, Response, Request
from jose import jwt, JWTError
from passlib.hash import argon2
from sqlalchemy.ext.asyncio import AsyncSession
from ..settings import settings
from ..db import get_session, init_db
from ..models import User, Session as SessionModel
from ..schemas import LoginRequest, RegisterRequest
from sqlalchemy import select, delete
import secrets

router = APIRouter()

ALG = "HS256"
COOKIE_OPTS = dict(httponly=True, samesite="lax")

def make_access(user_id: str) -> str:
    exp = datetime.now(tz=timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_MINUTES)
    return jwt.encode({"sub": user_id, "exp": exp}, settings.SECRET_KEY, algorithm="HS256")

def make_refresh(session_id: str) -> str:
    exp = datetime.now(tz=timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_DAYS)
    return jwt.encode({"sid": session_id, "exp": exp}, settings.SECRET_KEY, algorithm="HS256")

async def verify_refresh_token(db: AsyncSession, token: str) -> SessionModel | None:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALG])
        sid = payload.get("sid")
        if not sid:
            return None
    except JWTError:
        return None
    q = await db.execute(select(SessionModel).where(SessionModel.id == sid))
    session = q.scalar_one_or_none()
    return session

@router.on_event("startup")
async def on_startup():
    await init_db()

@router.post("/register")
async def register(data: RegisterRequest, db: AsyncSession = Depends(get_session)):
    username = data.username.strip().lower()
    email = data.email.strip().lower()
    pwd_hash = argon2.hash(data.password)
    u = User(username=username, email=email, password_hash=pwd_hash)
    db.add(u)
    try:
        await db.commit()
    except Exception:
        await db.rollback()
        raise HTTPException(400, "Usuário ou e-mail já existe")
    return {"ok": True}

@router.post("/login")
async def login(data: LoginRequest, resp: Response, db: AsyncSession = Depends(get_session)):
    username = data.username.strip().lower()
    q = await db.execute(select(User).where(User.username == username))
    user = q.scalar_one_or_none()
    if not user or not argon2.verify(data.password, user.password_hash):
        raise HTTPException(401, "Credenciais inválidas")

    # cria sessão e refresh
    session = SessionModel(user_id=user.id, refresh_hash=secrets.token_hex(32))
    db.add(session)
    await db.commit()
    await db.refresh(session)

    access = make_access(str(user.id))
    refresh = make_refresh(str(session.id))

    resp.set_cookie("access", access, max_age=settings.ACCESS_TOKEN_MINUTES*60, secure=True, **COOKIE_OPTS)
    resp.set_cookie("refresh", refresh, max_age=settings.REFRESH_TOKEN_DAYS*24*3600, secure=True, **COOKIE_OPTS)
    return {"ok": True}

@router.post("/refresh")
async def refresh(request: Request, resp: Response, db: AsyncSession = Depends(get_session)):
    token = request.cookies.get("refresh")
    if not token:
        raise HTTPException(401, "Sem refresh")
    session = await verify_refresh_token(db, token)
    if not session:
        raise HTTPException(401, "Refresh inválido")

    access = make_access(str(session.user_id))
    resp.set_cookie("access", access, max_age=settings.ACCESS_TOKEN_MINUTES*60, secure=True, **COOKIE_OPTS)
    return {"ok": True}

@router.post("/logout")
async def logout(request: Request, resp: Response, db: AsyncSession = Depends(get_session)):
    token = request.cookies.get("refresh")
    if token:
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALG])
            sid = payload.get("sid")
            if sid:
                await db.execute(delete(SessionModel).where(SessionModel.id == sid))
                await db.commit()
        except JWTError:
            pass
    resp.delete_cookie("access")
    resp.delete_cookie("refresh")
    return {"ok": True}
