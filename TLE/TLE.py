from flask import Flask, render_template, jsonify
import requests
import json
import os
from dotenv import load_dotenv

# Carregar variables d'entorn
load_dotenv()
API_KEY = os.getenv('N2YO_API_KEY')

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/satellite/<int:norad_id>/current')
def get_current_position(norad_id):
    """Obtenir només la posició actual del satèl·lit"""
    url = f"https://api.n2yo.com/rest/v1/satellite/positions/{norad_id}/41.3802/2.14/0/1/&apiKey={API_KEY}"
    
    try:
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            return jsonify({
                'status': 'success',
                'data': {
                    'info': {
                        'satname': data['info']['satname'],
                        'satid': data['info']['satid'],
                    },
                    'position': data['positions'][0]
                }
            })
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        })

@app.route('/api/satellite/<int:norad_id>')
def get_satellite_data(norad_id):
    # Demanem posicions per un període més llarg per cobrir l'òrbita completa
    # La ISS fa una òrbita completa en ~90 minuts, així que demanem 100 minuts per assegurar-nos
    url = f"https://api.n2yo.com/rest/v1/satellite/positions/{norad_id}/41.3802/2.14/0/3000/&apiKey={API_KEY}"
    
    try:
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            
            # Obtenim la posició actual i totes les prediccions
            positions = data['positions']
            current_position = positions[0]
            
            # Calculem l'òrbita completa (nord i sud)
            north_track = []
            south_track = []
            last_lat = positions[0]['satlatitude']
            going_north = None
            
            for pos in positions:
                current_lat = pos['satlatitude']
                
                # Determinem la direcció inicial
                if going_north is None:
                    going_north = current_lat > last_lat
                
                # Si canvia la direcció, comencem nova línia
                if (current_lat > last_lat) != going_north:
                    going_north = not going_north
                
                # Afegim el punt a la línia corresponent
                if going_north:
                    north_track.append(pos)
                else:
                    south_track.append(pos)
                    
                last_lat = current_lat
            
            return jsonify({
                'status': 'success',
                'data': {
                    'info': {
                        'satname': data['info']['satname'],
                        'satid': data['info']['satid'],
                    },
                    'current': current_position,
                    'north_track': north_track,
                    'south_track': south_track
                }
            })
            
        return jsonify({
            'status': 'error',
            'message': f'Error obtenint dades. Status code: {response.status_code}'
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        })

if __name__ == '__main__':
    app.run(debug=True)