import requests

# Clau de l'API
API_KEY = "Y7NY5E-B74EUE-XM89EE-5DHY"  # Substitueix per la teva clau d'API N2YO

# Paràmetres de l'observador
observer_lat = 41.3851    # Exemple: Latitud de Barcelona
observer_lng = 2.1734     # Exemple: Longitud de Barcelona
observer_alt = 10         # Altitud en metres sobre el nivell del mar

# ID del satèl·lit
satellite_id = 25544  # ISS (ZARYA)

# Altres paràmetres
days = 1             # Dies de predicció
min_visibility = 5   # Visibilitat mínima en segons

# URL de l'API
BASE_URL = "https://api.n2yo.com/rest/v1/satellite"
url = f"{BASE_URL}/visualpasses/{satellite_id}/{observer_lat}/{observer_lng}/{observer_alt}/{days}/{min_visibility}/&apiKey={API_KEY}"

try:
    # Crida a l'API
    response = requests.get(url)

    # Verifica si la resposta és correcta
    if response.status_code == 200:
        data = response.json()
        print(data)
        print(f"Passos visibles per al satèl·lit {satellite_id}:")
        for i, pass_data in enumerate(data.get("passes", [])):
            print(f"\nPassada {i+1}:")
            print(f" - Hora d'inici: {pass_data['startUTC']} UTC")
            print(f" - Durada: {pass_data['duration']} segons")
            print(f" - Altitud màxima: {pass_data['maxEl']}°")
            print(f" - Hora màxima: {pass_data['maxUTC']} UTC")
            print(f" - Hora de finalització: {pass_data['endUTC']} UTC")
    else:
        print(f"Error: {response.status_code}")
        print("Missatge:", response.text)

except Exception as e:
    print("Error durant la crida a l'API:", e)
