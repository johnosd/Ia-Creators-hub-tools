// Auto login para VoiceClone (https://voiceclone.dankicode.ai)
// Sempre que estiver na página /login ou quando os campos de login
// forem detectados, preenche e envia automaticamente.

const loginUrl = "https://voiceclone.dankicode.ai/login";
const loginUsuario = "alisonjn.gmx@gmail.com"; // ajuste conforme necessário
const loginSenha = "@1ed72cd%#"; // ajuste conforme necessário

let loginTentado = false;
let ultimaTentativa = 0;
const intervaloTentativaMs = 2000; // tenta novamente a cada 2s enquanto na tela de login

function bloquearPagina() {
  if (document.getElementById('__overlay-bloqueio-login__')) return;
  const overlay = document.createElement('div');
  overlay.id = '__overlay-bloqueio-login__';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = 'rgba(255, 255, 255, 0.85)';
  overlay.style.zIndex = '2147483647';
  overlay.style.cursor = 'wait';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.innerHTML = '<div style="font: 600 16px system-ui, sans-serif; color:#333">Efetuando login...</div>';
  document.documentElement.appendChild(overlay);
}

function desbloquearPagina() {
  const overlay = document.getElementById('__overlay-bloqueio-login__');
  if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
}

function isVoiceCloneHost() {
  return /(^|\.)voiceclone\.dankicode\.ai$/i.test(location.hostname);
}

function isLoginPage() {
  if (!isVoiceCloneHost()) return false;
  if (/^\/login(\/|$)?/i.test(location.pathname)) return true;
  return !!document.querySelector("input[type='password']");
}

function setValue(el, value) {
  if (!el) return;
  el.focus();
  el.value = value;
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
}

function findEmailField() {
  return (
    document.getElementById('email') ||
    document.querySelector("input[type='email']") ||
    document.querySelector("input[name='email']") ||
    document.querySelector("input[name='username']") ||
    document.getElementById('username')
  );
}

function findPasswordField() {
  return (
    document.getElementById('password') ||
    document.querySelector("input[type='password']") ||
    document.querySelector("[name='password']")
  );
}

function temCamposDeLogin() {
  return !!(findEmailField() && findPasswordField());
}

function findSubmitButton() {
  let btn = document.querySelector("button[type='submit'], input[type='submit']");
  if (btn) return btn;

  const candidates = Array.from(
    document.querySelectorAll("button, input[type='button'], a[role='button']")
  ).filter((b) => {
    const text = (b.innerText || b.value || "").toLowerCase();
    return /entrar|login|log in|sign in|acessar|acesso/.test(text);
  });
  if (candidates.length) return candidates[0];

  const visible = Array.from(document.querySelectorAll('button')).find((b) => {
    const r = b.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  });
  return visible || null;
}

function tentarLogin() {
  if (!isVoiceCloneHost()) return;
  if (!isLoginPage()) return;

  const agora = Date.now();
  if (loginTentado && agora - ultimaTentativa < intervaloTentativaMs) return;

  const userField = findEmailField();
  const passField = findPasswordField();
  const submit = findSubmitButton();

  if (userField && passField && submit) {
    bloquearPagina();
    setValue(userField, loginUsuario);
    setValue(passField, loginSenha);
    loginTentado = true;
    ultimaTentativa = agora;

    // Primeiro tenta clicar no botão
    submit.click();

    // Fallback: submete o form mais próximo se ainda estiver na tela de login
    const form = submit.closest('form') || userField.closest('form') || passField.closest('form');
    if (form) {
      setTimeout(() => {
        if (isLoginPage()) {
          if (typeof form.requestSubmit === 'function') form.requestSubmit();
          else form.submit();
        }
      }, 300);
    }

    // Se ainda estiver na tela de login após alguns segundos, libera nova tentativa
    setTimeout(() => {
      if (isLoginPage()) loginTentado = false;
    }, 3000);
  }
}

// Executa cedo e continua tentando conforme SPA navega ou DOM muda
try { tentarLogin(); } catch (_) {}
document.addEventListener('DOMContentLoaded', () => {
  tentarLogin();
});

let lastUrl = location.href;
setInterval(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    loginTentado = false;
  }
  tentarLogin();
  if (!temCamposDeLogin()) {
    desbloquearPagina();
  }
}, 500);

try {
  const observer = new MutationObserver(() => tentarLogin());
  observer.observe(document.documentElement, { childList: true, subtree: true });
} catch (_) {}
