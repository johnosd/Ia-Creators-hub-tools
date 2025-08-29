"use client";
import { useEffect, useRef, useState } from "react";
import { API_BASE } from "@/lib/config";
import { useRouter } from "next/navigation";

type Msg = { role: "user" | "assistant"; content: string };

export default function Chat() {
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const router = useRouter();
  const listRef = useRef<HTMLDivElement>(null);

  async function ensureAuth() {
    // tenta /me; se 401, tenta refresh; se falhar, redireciona
    let r = await fetch(`${API_BASE}/me`, { credentials: "include" });
    if (r.status === 401) {
      const rr = await fetch(`${API_BASE}/auth/refresh`, { method: "POST", credentials: "include" });
      if (!rr.ok) router.push("/login");
    }
  }

  useEffect(() => {
    ensureAuth();
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [msgs]);

  function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const val = input.trim();
    if (!val) return;

    setMsgs((m) => [...m, { role: "user", content: val }, { role: "assistant", content: "" }]);
    setInput("");

    const es = new EventSource(`${API_BASE}/chat/stream`, { withCredentials: true });
    es.onopen = () => {
      fetch(`${API_BASE}/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message: val }),
      });
      // OBS: alguns proxies não suportam POST + SSE no mesmo endpoint;
      // esta demo abre a conexão mas dispara o POST separado. Alternativa: usar fetch com ReadableStream.
    };
    es.onmessage = (ev) => {
      if (ev.data === "[DONE]") {
        es.close();
        return;
      }
      try {
        const data = JSON.parse(ev.data);
        const delta = data.delta || "";
        setMsgs((m) => {
          const copy = [...m];
          const last = copy[copy.length - 1];
          if (last?.role === "assistant") last.content += delta;
          return copy;
        });
      } catch {}
    };
    es.onerror = () => es.close();
  }

  return (
    <div className="h-screen grid grid-rows-[auto,1fr,auto]">
      <header className="border-b p-3 font-semibold">Meu Chat</header>
      <div ref={listRef} className="overflow-y-auto p-4 space-y-3">
        {msgs.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
            <div className={`inline-block rounded-2xl px-3 py-2 ${m.role === "user" ? "bg-black text-white" : "bg-white border"}`}>
              {m.content}
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="p-3 border-t flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-2"
          placeholder="Digite sua mensagem..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="bg-black text-white rounded px-4">Enviar</button>
      </form>
    </div>
  );
}
