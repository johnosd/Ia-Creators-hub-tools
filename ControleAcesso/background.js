const SUPABASE_URL = "https://hivoszltiypktloztpye.supabase.co/rest/v1";
const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhpdm9zemx0aXlwa3Rsb3p0cHllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NjY2NjQsImV4cCI6MjA2OTU0MjY2NH0.b4QIHJNOljZgvaJAib4miGpu-A23A_-u6b9a4jj2bew";
const SITES_RESTRITOS = ["facebook.com", "youtube.com"];

// Sempre exigir validação ao acessar site restrito.
// Após validação, concedemos liberação única por aba (via storage.session).
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    const url = new URL(tab.url);
    if (SITES_RESTRITOS.some(site => url.hostname.includes(site))) {
      const key = `allow_${tabId}`;
      chrome.storage.session.get(key, (res) => {
        const entry = res[key];
        const now = Date.now();
        if (
          entry &&
          entry.hostname &&
          url.hostname.includes(entry.hostname) &&
          entry.expire && entry.expire > now
        ) {
          // Consome a liberação única e permite a navegação
          chrome.storage.session.remove(key);
          return;
        }

        // Redireciona para página de bloqueio com o destino como parâmetro
        const destino = `${chrome.runtime.getURL("bloqueio.html")}?target=${encodeURIComponent(tab.url)}`;
        chrome.tabs.update(tabId, { url: destino });
      });
    }
  }
});

