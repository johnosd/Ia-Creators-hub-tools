import requests
import time

API_BASE = "http://local.adspower.net:50325"
USER_ID = "k10mkohr"  # seu profile_id

def open_browser(original=True, params=None):
    endpoint = "/api/v1/browser/start" + ("" if original else "/v2")
    url = API_BASE + endpoint
    params = params or {}
    params["user_id"] = USER_ID
    resp = requests.get(url, params=params).json()
    if resp.get("code") != 0:
        raise Exception(f"Erro ao abrir browser: {resp.get('msg')}")
    print("Navegador aberto com sucesso.")
    return resp["data"]

def close_browser(original=True):
    endpoint = "/api/v1/browser/stop" + ("" if original else "/v2")
    url = API_BASE + endpoint
    resp = requests.get(url, params={"user_id": USER_ID}).json()
    if resp.get("code") != 0:
        raise Exception(f"Erro ao fechar browser: {resp.get('msg')}")
    print("Navegador fechado com sucesso.")

if __name__ == "__main__":
    # Exemplo rota original
    data = open_browser(original=True)
    # Aguarda ou faça algo
    time.sleep(5)
    close_browser(original=True)

    # Exemplo rota V2 (mesma lógica, se suportada)
    data2 = open_browser(original=False)
    time.sleep(5)
    close_browser(original=False)
