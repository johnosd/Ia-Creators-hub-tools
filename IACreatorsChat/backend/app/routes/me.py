from fastapi import APIRouter, Depends, HTTPException, Request
from jose import jwt, JWTError
from ..settings import settings
from ..db import get_session
from sqlalchemy.ext.asyncio import AsyncSession
from ..models import User
from sqlalchemy import select

router = APIRouter()

def get_user_id_from_request(request: Request) -> str | None:
    token = request.cookies.get("access")
    if not token:
        return None
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        return payload.get("sub")
    except JWTError:
        return None

@router.get("/me")
async def me(request: Request, db: AsyncSession = Depends(get_session)):
    user_id = get_user_id_from_request(request)
    if not user_id:
        raise HTTPException(401, "Não autenticado")
    q = await db.execute(select(User).where(User.id == user_id))
    user = q.scalar_one_or_none()
    if not user:
        raise HTTPException(401, "Usuário não encontrado")
    return {"id": str(user.id), "username": user.username, "email": user.email}
