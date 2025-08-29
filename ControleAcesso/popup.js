const SUPABASE_URL = "https://hivoszltiypktloztpye.supabase.co/rest/v1";
const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhpdm9zemx0aXlwa3Rsb3p0cHllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NjY2NjQsImV4cCI6MjA2OTU0MjY2NH0.b4QIHJNOljZgvaJAib4miGpu-A23A_-u6b9a4jj2bew";

const SUPORTE = "Suporte: contato@fux.com";
const LINK_RENOVACAO = "https://pay.kirvano.com/f4d068ca-d912-4d65-8a53-9bdf54291475";

const SENHA_ADMIN = "admin123"; // Altere para sua senha desejada

document.addEventListener("DOMContentLoaded", () => {
  // Tabs
  const tabAcesso = document.getElementById("tab-acesso");
  const tabAdmin = document.getElementById("tab-admin");
  const abaAcesso = document.getElementById("aba-acesso");
  const abaAdmin = document.getElementById("aba-admin");

  tabAcesso.addEventListener("click", () => {
    tabAcesso.classList.add("active");
    tabAdmin.classList.remove("active");
    abaAcesso.classList.remove("hidden");
    abaAdmin.classList.add("hidden");
  });
  tabAdmin.addEventListener("click", () => {
    tabAdmin.classList.add("active");
    tabAcesso.classList.remove("active");
    abaAdmin.classList.remove("hidden");
    abaAcesso.classList.add("hidden");
  });

  // Admin login
  document.getElementById("btn-login").onclick = function() {
    const senha = document.getElementById("senha-admin").value;
    const msg = document.getElementById("msg-login");
    if (senha === SENHA_ADMIN) {
      document.getElementById("login-admin").classList.add("hidden");
      document.getElementById("painel-admin").classList.remove("hidden");
      msg.textContent = "";
    } else {
      msg.textContent = "Senha incorreta.";
    }
  };

  // Cadastro de chave
  document.getElementById("form-chave").onsubmit = function(e) {
    e.preventDefault();
    const chave = document.getElementById("nova-chave").value.trim();
    const validade = document.getElementById("validade-chave").value;
    const msg = document.getElementById("msg-admin");
    msg.textContent = "";
    if (!chave || !validade) {
      msg.textContent = "Preencha todos os campos.";
      msg.className = "erro";
      return;
    }
    fetch(`${SUPABASE_URL}/chaves`, {
      method: "POST",
      headers: {
        apikey: API_KEY,
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "return=representation"
      },
      body: JSON.stringify({
        chave: chave,
        ativa: true,
        valida_ate: validade
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data && data.length > 0) {
        msg.textContent = "Chave cadastrada com sucesso!";
        msg.className = "sucesso";
        document.getElementById("form-chave").reset();
      } else {
        msg.textContent = "Erro ao cadastrar chave.";
        msg.className = "erro";
      }
    })
    .catch(() => {
      msg.textContent = "Erro de comunicação com o servidor.";
      msg.className = "erro";
    });
  };

  document.getElementById("validar").addEventListener("click", () => {
    const chave = document.getElementById("chave").value.trim();
    const dataHoje = new Date().toISOString().split("T")[0];

    fetch(`${SUPABASE_URL}/chaves?chave=eq.${chave}`, {
      headers: {
        apikey: API_KEY,
        Authorization: `Bearer ${API_KEY}`
      }
    })
    .then(res => res.json())
    .then(data => {
      const mensagem = document.getElementById("mensagem");
      const extras = document.getElementById("extras");
      extras.innerHTML = "";

      if (data.length === 0) {
        mensagem.innerHTML = "❌ Chave inválida.";
        mensagem.className = "erro";
        extras.innerHTML = SUPORTE;
        return;
      }

      const chaveInfo = data[0];

      if (!chaveInfo.ativa || chaveInfo.valida_ate < dataHoje) {
        mensagem.innerHTML = "⚠️ Sua chave está vencida.";
        mensagem.className = "erro";
        extras.innerHTML = `<a class='link' href='${LINK_RENOVACAO}' target='_blank'>🔁 Renovar acesso</a><br>${SUPORTE}`;
        return;
      }

      fetch(`${SUPABASE_URL}/acessos?chave=eq.${chave}&data_acesso=eq.${dataHoje}`, {
        headers: {
          apikey: API_KEY,
          Authorization: `Bearer ${API_KEY}`
        }
      })
      .then(res => res.json())
      .then(acessos => {
        if (acessos.length === 0) {
          fetch(`${SUPABASE_URL}/acessos`, {
            method: "POST",
            headers: {
              apikey: API_KEY,
              Authorization: `Bearer ${API_KEY}`,
              "Content-Type": "application/json",
              "Prefer": "return=representation"
            },
            body: JSON.stringify({
              chave,
              data_acesso: dataHoje,
              user_agent: navigator.userAgent
            })
          });
        }

        chrome.storage.local.set({
          chave_validada: chave,
          data_validacao: dataHoje
        }, () => {
          mensagem.textContent = "✅ Acesso liberado para hoje.";
          mensagem.className = "";
        });
      });
    });
  });
});