const SUPABASE_URL = "https://hivoszltiypktloztpye.supabase.co/rest/v1";
const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhpdm9zemx0aXlwa3Rsb3p0cHllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NjY2NjQsImV4cCI6MjA2OTU0MjY2NH0.b4QIHJNOljZgvaJAib4miGpu-A23A_-u6b9a4jj2bew";

const SUPORTE = "Suporte: contato@fux.com";
const LINK_RENOVACAO = "https://pay.kirvano.com/f4d068ca-d912-4d65-8a53-9bdf54291475";

const SENHA_ADMIN = "admin123"; // Altere para sua senha desejada

document.addEventListener("DOMContentLoaded", () => {
  // Tabs (existem apenas no popup)
  const tabAcesso = document.getElementById("tab-acesso");
  const tabAdmin = document.getElementById("tab-admin");
  const abaAcesso = document.getElementById("aba-acesso");
  const abaAdmin = document.getElementById("aba-admin");

  if (tabAcesso && tabAdmin && abaAcesso && abaAdmin) {
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
  }

  // Admin login (apenas no popup)
  const btnLogin = document.getElementById("btn-login");
  if (btnLogin) {
    btnLogin.onclick = function () {
      const senhaEl = document.getElementById("senha-admin");
      const msg = document.getElementById("msg-login");
      const painel = document.getElementById("painel-admin");
      const login = document.getElementById("login-admin");
      const senha = senhaEl ? senhaEl.value : "";
      if (senha === SENHA_ADMIN) {
        if (login) login.classList.add("hidden");
        if (painel) painel.classList.remove("hidden");
        if (msg) msg.textContent = "";
      } else {
        if (msg) msg.textContent = "Senha incorreta.";
      }
    };
  }

  // Cadastro de chave (apenas no popup)
  const formChave = document.getElementById("form-chave");
  if (formChave) {
    formChave.onsubmit = function (e) {
      e.preventDefault();
      const chave = document.getElementById("nova-chave");
      const validade = document.getElementById("validade-chave");
      const msg = document.getElementById("msg-admin");
      if (msg) msg.textContent = "";
      const chaveVal = chave ? chave.value.trim() : "";
      const validadeVal = validade ? validade.value : "";
      if (!chaveVal || !validadeVal) {
        if (msg) {
          msg.textContent = "Preencha todos os campos.";
          msg.className = "erro";
        }
        return;
      }
      fetch(`${SUPABASE_URL}/chaves`, {
        method: "POST",
        headers: {
          apikey: API_KEY,
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
          "Prefer": "return=representation",
        },
        body: JSON.stringify({ chave: chaveVal, ativa: true, valida_ate: validadeVal }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.length > 0) {
            if (msg) {
              msg.textContent = "Chave cadastrada com sucesso!";
              msg.className = "sucesso";
            }
            formChave.reset();
          } else {
            if (msg) {
              msg.textContent = "Erro ao cadastrar chave.";
              msg.className = "erro";
            }
          }
        })
        .catch(() => {
          if (msg) {
            msg.textContent = "Erro de comunicação com o servidor.";
            msg.className = "erro";
          }
        });
    };
  }

  // Validação de chave (popup e bloqueio)
  const btnValidar = document.getElementById("validar");
  if (btnValidar) {
    btnValidar.addEventListener("click", () => {
      const chaveEl = document.getElementById("chave");
      const chave = chaveEl ? chaveEl.value.trim() : "";
      const dataHoje = new Date().toISOString().split("T")[0];

      fetch(`${SUPABASE_URL}/chaves?chave=eq.${chave}`, {
        headers: { apikey: API_KEY, Authorization: `Bearer ${API_KEY}` },
      })
        .then((res) => res.json())
        .then((data) => {
          const mensagem = document.getElementById("mensagem");
          const extras = document.getElementById("extras");
          if (extras) extras.innerHTML = "";

          if (!Array.isArray(data) || data.length === 0) {
            if (mensagem) {
              mensagem.textContent = "Chave inválida.";
              mensagem.className = "erro";
            }
            if (extras) extras.textContent = SUPORTE;
            return;
          }

          const chaveInfo = data[0];
          if (!chaveInfo.ativa || chaveInfo.valida_ate < dataHoje) {
            if (mensagem) {
              mensagem.textContent = "Sua chave está vencida.";
              mensagem.className = "erro";
            }
            if (extras) {
              extras.innerHTML = `<a class='link' href='${LINK_RENOVACAO}' target='_blank'>Renovar acesso</a><br>${SUPORTE}`;
            }
            return;
          }

          // Registra acesso do dia (uma vez)
          fetch(`${SUPABASE_URL}/acessos?chave=eq.${chave}&data_acesso=eq.${dataHoje}`, {
            headers: { apikey: API_KEY, Authorization: `Bearer ${API_KEY}` },
          })
            .then((res) => res.json())
            .then((acessos) => {
              if (Array.isArray(acessos) && acessos.length === 0) {
                fetch(`${SUPABASE_URL}/acessos`, {
                  method: "POST",
                  headers: {
                    apikey: API_KEY,
                    Authorization: `Bearer ${API_KEY}`,
                    "Content-Type": "application/json",
                    "Prefer": "return=representation",
                  },
                  body: JSON.stringify({ chave, data_acesso: dataHoje, user_agent: navigator.userAgent }),
                });
              }

              // Liberação apenas para este acesso: se vier de bloqueio com destino, volta para o site
              const params = new URLSearchParams(window.location.search);
              const target = params.get("target");
              if (target) {
                try {
                  const hostname = new URL(target).hostname;
                  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    const activeTab = tabs && tabs[0];
                    if (!activeTab) return;
                    const allowKey = `allow_${activeTab.id}`;
                    chrome.storage.session.set({ [allowKey]: { hostname, expire: Date.now() + 15000 } }, () => {
                      chrome.tabs.update(activeTab.id, { url: target });
                    });
                  });
                } catch (_) {
                  if (mensagem) {
                    mensagem.textContent = "Acesso liberado.";
                    mensagem.className = "sucesso";
                  }
                }
              } else {
                if (mensagem) {
                  mensagem.textContent = "Acesso liberado.";
                  mensagem.className = "sucesso";
                }
              }
            });
        });
    });
  }
});

