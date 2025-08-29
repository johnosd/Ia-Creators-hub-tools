# Template Chat tipo ChatGPT (Login + Chat + Streaming)

## Estrutura
- `backend/` (FastAPI, auth com cookies, SSE de chat, SQLite)
- `frontend/` (Next.js + Tailwind, telas de Login e Chat)
- `docker-compose.yml` para dev local

## Como rodar (dev local)
1. **Backend**
   ```bash
   cd backend
   cp .env.example .env
   # edite SECRET_KEY e OPENAI_API_KEY se for usar de verdade
   python -m venv .venv && source .venv/bin/activate
   pip install -r requirements.txt
   python run.py
   ```

2. **Frontend**
   ```bash
   cd frontend
   cp .env.local.example .env.local
   npm install
   npm run dev
   # abra http://localhost:3000
   ```

3. **Criar usuário (registro)**
   - POST `http://localhost:8000/auth/register` com JSON: `{ "username": "teste", "email": "t@e.co", "password": "123456" }`
   - Faça login em `/login` (frontend).

## Ajustes importantes
- Trocar SQLite por Postgres: altere `DATABASE_URL` no backend `.env`.
- Produção: use **HTTPS**, `Secure` cookies e configure CORS para o domínio do frontend.
- Rate-limit de login e rotas pode ser adicionado com Redis (Upstash).
- SSE do exemplo abre EventSource e dispara POST separado; em produção, considere usar `fetch`+`ReadableStream` para um único fluxo, ou WebSocket.

## Docker (opcional)
- Existem `Dockerfile`s separados; você pode orquestrar com `docker-compose` facilmente.
