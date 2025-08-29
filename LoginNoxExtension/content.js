// Verifica se a página tem campos de login
function temCamposDeLogin() {
  return (
    document.querySelector("input[name='amember_login']") &&
    document.querySelector("input[name='amember_pass']") &&
    document.querySelector("form[name='login']")
  );
}

// Preenche o formulário de login e envia
function fazerLogin(user, pass) {
  const form = document.querySelector("form[name='login']");
  if (!form) return;

  const userInput = form.querySelector("input[name='amember_login']");
  const passInput = form.querySelector("input[name='amember_pass']");
  const submitBtn = form.querySelector("input[type='submit']");

  if (!userInput || !passInput || !submitBtn) return;

  userInput.value = "";
  passInput.value = "";

  userInput.value = user;
  passInput.value = pass;

  setTimeout(() => {
    submitBtn.click();
  }, 300);
}

// Substitui logo por "IA CREATORS HUB"
function substituirLogo() {
  const logoWrapper = document.querySelector(".am-header-logo-wrapper");
  if (logoWrapper) {
    logoWrapper.innerHTML = `<div style="font-size: 18px; font-weight: bold; color: #333; padding: 10px;">IA CREATORS HUB</div>`;
  }
}

// Remove o menu de navegação
function removerMenuSuperior() {
  const tabs = document.querySelector("ul.am-tabs");
  if (tabs) {
    tabs.remove();
  }
}

// Remove o rodapé
function removerRodape() {
  const footer = document.querySelector(".am-footer-content-content");
  if (footer) {
    footer.remove();
  }
}

// Bloqueia interações durante login
function bloquearPagina() {
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
  overlay.style.zIndex = "9999";
  overlay.style.cursor = "wait";
  document.body.appendChild(overlay);
}

// Inicia o login automático em qualquer página com o formulário de login
function iniciarLoginAutomatico() {
  const user = "ch.ai.global01@gmail.com";
  const pass = "150825@ia";

  if (!user || !pass) {
    alert("Credenciais não configuradas.");
    return;
  }

  // Tenta encontrar e logar automaticamente sempre que o form existir
  const checkForm = setInterval(() => {
    if (temCamposDeLogin()) {
      clearInterval(checkForm);
      bloquearPagina();
      fazerLogin(user, pass);
    }
  }, 300);
}

// Escuta chamada do background (opcional, para login manual)
chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "executarLogin") {
    iniciarLoginAutomatico();
  }
});

// Sempre executa nas páginas-alvo
window.addEventListener("load", () => {
  iniciarLoginAutomatico();
  substituirLogo();
  removerMenuSuperior();
  removerRodape();
});
