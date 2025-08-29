"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE } from "@/lib/config";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data?.detail || "Erro ao logar");
      return;
    }
    router.push("/chat");
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={onSubmit} className="bg-white rounded-xl shadow p-6 w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold">Entrar</h1>
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Usuário"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="w-full border rounded px-3 py-2"
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button className="w-full bg-black text-white rounded py-2">Entrar</button>
      </form>
    </div>
  );
}
