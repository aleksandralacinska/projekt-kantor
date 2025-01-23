import requests

API_URL = "https://api.nbp.pl/api/exchangerates/rates/A"

def fetch_exchange_rate(currency: str) -> float:
    """
    Pobiera kurs wymiany dla danej waluty z API NBP.
    """
    try:
        response = requests.get(f"{API_URL}/{currency}/?format=json")
        response.raise_for_status()
        data = response.json()
        return data["rates"][0]["mid"]
    except requests.RequestException:
        return None
