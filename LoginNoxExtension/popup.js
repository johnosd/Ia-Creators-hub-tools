// popup.js

// Função para codificar texto em base64
function enc(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

// Lista de aplicativos disponíveis
const apps = {
  envato: "https://noxtools.com/secure/page/envato",
  heygen: "https://noxtools.com/secure/page/HeyGen",
  leonardo: "https://noxtools.com/secure/page/leonardo",
  hailuo: "https://noxtools.com/secure/page/Hailuoai",
  midjourney: "https://noxtools.com/secure/page/Midjourney+pro",
  chatGpt: "https://noxtools.com/secure/page/ChatGPT+NEW",
  capcut: "https://noxtools.com/secure/page/CapCut",
  youAi: "https://noxtools.com/secure/page/youai",
  adobeExpress: "https://noxtools.com/secure/page/Adobe+Express",
  outrosApps: "https://noxtools.com/secure/member"
};

// Preenche dinamicamente o select de apps
const appSelect = document.getElementById("app");
for (const key in apps) {
  const option = document.createElement("option");
  option.value = key;
  option.textContent = key.charAt(0).toUpperCase() + key.slice(1);
  appSelect.appendChild(option);
}

// Quando o botão "Salvar" for clicado
document.getElementById("save").addEventListener("click", () => {
  const user = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value.trim();
  const app = appSelect.value;

  if (!user || !pass) {
    alert("Por favor, preencha usuário e senha.");
    return;
  }

  // Armazena as credenciais e os apps disponíveis
  chrome.storage.local.set({
    login_user: enc(user),
    login_pass: enc(pass),
    selected_app: app,
    apps: apps
  }, () => {
    alert("Credenciais e app selecionado salvos com sucesso!");
  });
});
