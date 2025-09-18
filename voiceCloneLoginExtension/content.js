const urlsBloqueadas = [
  "https://www.avmakers.com.br/painel/conta-de-usuario",
  "https://www.avmakers.com.br/painel/meu-plano",
  "https://www.avmakers.com.br/painel/meus-dados/senha"
];
const urlRedirecionamento = "https://www.avmakers.com.br/painel/cursos";

// Dados de login automático
const loginUrl = "https://www.avmakers.com.br/login";
const loginUsuario = "johnscosta2@gmail.com";
const loginSenha = "02082025@m";
let loginTentado = false;

// Mostra uma tela branca cobrindo tudo com mensagem de redirecionamento
function mostrarMascara() {
  if (document.getElementById('__mascara-bloqueio__')) return; // Evita duplicar
  const mask = document.createElement('div');
  mask.id = '__mascara-bloqueio__';
  mask.style.position = 'fixed';
  mask.style.top = '0';
  mask.style.left = '0';
  mask.style.width = '100vw';
  mask.style.height = '100vh';
  mask.style.background = '#fff';
  mask.style.zIndex = '999999';
  mask.style.display = 'flex';
  mask.style.alignItems = 'center';
  mask.style.justifyContent = 'center';
  mask.innerHTML = '<h2 style="color:#444;font-family:sans-serif">Redirecionando...</h2>';
  document.body.appendChild(mask);
}

// Remove o botão/avatar do usuário do DOM
function removerBotaoUsuario() {
  // Use uma classe exclusiva desse botão (ajuste se o site mudar)
  const botoes = document.querySelectorAll('.MuiAvatar-img[src*="aluno-sem-foto.png"]');
  botoes.forEach(img => {
    // Sobe até o elemento <button> mais próximo e remove tudo
    const botao = img.closest('button');
    if (botao) {
      const wrapper = botao.closest('.sc-cAQujh.eWefkQ.MuiGrid2-root.MuiGrid2-direction-xs-row');
      if (wrapper) {
        wrapper.remove();
      } else {
        botao.remove();
      }
    }
  });
}

// Efetua o login automático na página de login
function tentarLogin() {
  if (window.location.href !== loginUrl || loginTentado) return;

  const userField = document.getElementById('username');
  const passField = document.getElementById('password');
  const botao = document.querySelector('button.btn.btn-success.w-100');

  if (userField && passField && botao) {
    userField.value = loginUsuario;
    passField.value = loginSenha;
    botao.click();
    loginTentado = true;

    // Valida se o login deu certo verificando se o botão sumiu
    const verificar = setInterval(() => {
      if (!document.querySelector('button.btn.btn-success.w-100')) {
        clearInterval(verificar);
      }
    }, 500);
  }
}

// Função principal: bloqueia páginas sensíveis e remove menus
function rotinaSeguranca() {
  if (urlsBloqueadas.includes(window.location.href)) {
    mostrarMascara();
    setTimeout(() => {
      window.location.replace(urlRedirecionamento);
    }, 100); // Pequeno atraso para garantir a máscara na tela
  }
  removerBotaoUsuario();
}

// Executa ao abrir a página
rotinaSeguranca();
tentarLogin();

// Executa sempre que trocar a URL (SPA) ou periodicamente reforça a remoção do menu
let lastUrl = location.href;
setInterval(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    rotinaSeguranca();
    loginTentado = false; // permite nova tentativa de login ao mudar de página
  } else {
    removerBotaoUsuario(); // Garante remoção até se o menu for recriado por script do site
  }
  tentarLogin();
}, 500);
