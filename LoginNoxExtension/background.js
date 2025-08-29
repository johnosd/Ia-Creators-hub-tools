// Quando o usuário clica no ícone da extensão
chrome.action.onClicked.addListener((tab) => {
  // Envia uma mensagem para content.js solicitando login
  chrome.tabs.sendMessage(tab.id, { action: "executarLogin" }, (response) => {
    if (chrome.runtime.lastError) {
      // content.js não está injetado na aba (provavelmente fora da URL permitida)
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          alert("Essa extensão só funciona no site https://noxtools.com/");
        }
      });
    }
  });
});
