from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import StreamingResponse
from ..settings import settings
from .me import get_user_id_from_request
import asyncio
import json
import httpx

router = APIRouter()

async def sse_generator(prompt: str):
    # Exemplo simples de stream "fake" se não houver OPENAI_API_KEY
    if not settings.OPENAI_API_KEY:
        for chunk in ["(Demo) ", "Configure sua ", "OPENAI_API_KEY ", "no backend/.env"]:
            yield f"data: {json.dumps({'delta': chunk})}\n\n"
            await asyncio.sleep(0.2)
        yield "data: [DONE]\n\n"
        return

    # Exemplo real via OpenAI Responses API streaming
    # Ajuste o modelo conforme necessário
    url = "https://api.openai.com/v1/responses"
    headers = {"Authorization": f"Bearer {settings.OPENAI_API_KEY}", "Content-Type": "application/json"}
    payload = {
        "model": "gpt-4o-mini",
        "input": prompt,
        "stream": True,
    }
    async with httpx.AsyncClient(timeout=60) as client:
        async with client.stream("POST", url, headers=headers, json=payload) as r:
            async for line in r.aiter_lines():
                if not line:
                    continue
                if line.startswith("data: "):
                    if line.strip() == "data: [DONE]":
                        yield "data: [DONE]\n\n"
                        break
                    yield line + "\n"

@router.post("/stream")
async def chat_stream(request: Request):
    user_id = get_user_id_from_request(request)
    if not user_id:
        raise HTTPException(401, "Não autenticado")
    body = await request.json()
    prompt = body.get("message", "").strip()
    if not prompt:
        raise HTTPException(400, "Mensagem vazia")
    return StreamingResponse(sse_generator(prompt), media_type="text/event-stream")
