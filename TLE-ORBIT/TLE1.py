from flask import Flask, render_template, jsonify
import requests
import os
from dotenv import load_dotenv
from skyfield.api import load, EarthSatellite, utc
from datetime import datetime, timedelta

load_dotenv()
API_KEY = os.getenv('N2YO_API_KEY')
app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/satellite/<int:norad_id>')
def get_satellite_data(norad_id):
    url = f"https://api.n2yo.com/rest/v1/satellite/tle/{norad_id}&apiKey={API_KEY}"
    
    try:
        response = requests.get(url)
        data = response.json()
        
        ts = load.timescale()
        line1, line2 = data['tle'].split('\r\n')
        satellite = EarthSatellite(line1, line2, data['info']['satname'], ts)
        
        positions = []
        now = datetime.now(utc)
        
        for minutes in range(0, 120, 2):
            time = now + timedelta(minutes=minutes)
            t = ts.from_datetime(time)
            geocentric = satellite.at(t)
            subpoint = geocentric.subpoint()
            
            positions.append({
                'satlatitude': float(subpoint.latitude.degrees),
                'satlongitude': float(subpoint.longitude.degrees),
                'sataltitude': float(subpoint.elevation.km)
            })
        
        return jsonify({
            'status': 'success',
            'data': {
                'info': data['info'],
                'positions': positions
            }
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'status': 'error', 'message': str(e)})

@app.route('/api/satellite/<int:norad_id>/current')
def get_current_position(norad_id):
    url = f"https://api.n2yo.com/rest/v1/satellite/tle/{norad_id}&apiKey={API_KEY}"
    
    try:
        response = requests.get(url)
        data = response.json()
        
        ts = load.timescale()
        line1, line2 = data['tle'].split('\r\n')
        satellite = EarthSatellite(line1, line2, data['info']['satname'], ts)
        
        t = ts.from_datetime(datetime.now(utc))
        geocentric = satellite.at(t)
        subpoint = geocentric.subpoint()
        
        position = {
            'satlatitude': float(subpoint.latitude.degrees),
            'satlongitude': float(subpoint.longitude.degrees),
            'sataltitude': float(subpoint.elevation.km)
        }
        
        return jsonify({
            'status': 'success',
            'data': {
                'info': data['info'],
                'position': position
            }
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'status': 'error', 'message': str(e)})

if __name__ == '__main__':
    app.run(debug=True)