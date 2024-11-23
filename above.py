import requests

# Clau de l'API
API_KEY = "Y7NY5E-B74EUE-XM89EE-5DHY"  # Substitueix per la teva clau d'API N2YO

# Configuració de coordenades
latitude = 41.3851    # Exemple: Latitud de Barcelona
longitude = 2.1734    # Exemple: Longitud de Barcelona
altitude = 0          # Altitud (en metres sobre el nivell del mar)

# URL de l'API
BASE_URL = "https://api.n2yo.com/rest/v1/satellite/above"
url = f"{BASE_URL}/{latitude}/{longitude}/{altitude}/70/18/&apiKey={API_KEY}"

try:
    # Crida a l'API
    response = requests.get(url)

    # Verifica si la resposta és correcta
    if response.status_code == 200:
        data = response.json()
        print("Satèl·lits visibles:")
        for sat in data.get("above", []):
            print(f"- {sat['satname']} (ID: {sat['satid']}) | Altitud: {sat['satalt']} km")
    else:
        print(f"Error: {response.status_code}")
        print("Missatge:", response.text)

except Exception as e:
    print("Error durant la crida a l'API:", e)
