const SUPABASE_URL = "https://hivoszltiypktloztpye.supabase.co/rest/v1";
const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhpdm9zemx0aXlwa3Rsb3p0cHllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NjY2NjQsImV4cCI6MjA2OTU0MjY2NH0.b4QIHJNOljZgvaJAib4miGpu-A23A_-u6b9a4jj2bew"
const SITES_RESTRITOS = ["facebook.com", "youtube.com"];

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    const url = new URL(tab.url);
    if (SITES_RESTRITOS.some(site => url.hostname.includes(site))) {
      chrome.storage.local.get(["chave_validada", "data_validacao"], (res) => {
        const hoje = new Date().toISOString().split("T")[0];
        if (res.chave_validada && res.data_validacao === hoje) {
          return; // já validou hoje
        }

        // redirecionar a aba para a página de bloqueio da extensão
        chrome.tabs.update(tabId, {
          url: chrome.runtime.getURL("bloqueio.html")
        });
      });
    }
  }
});