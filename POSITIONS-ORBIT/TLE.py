from flask import Flask, render_template, jsonify
import requests
import os
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv('N2YO_API_KEY')

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/satellite/<int:norad_id>')
def get_satellite_data(norad_id):
    url = f"https://api.n2yo.com/rest/v1/satellite/positions/{norad_id}/41.3802/2.14/0/3000/&apiKey={API_KEY}"
    
    try:
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            positions = data['positions']
            return jsonify({
                'status': 'success',
                'data': {
                    'info': data['info'],
                    'positions': positions
                }
            })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        })

@app.route('/api/satellite/<int:norad_id>/current')
def get_current_position(norad_id):
    url = f"https://api.n2yo.com/rest/v1/satellite/positions/{norad_id}/41.3802/2.14/0/1/&apiKey={API_KEY}"
    
    try:
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            return jsonify({
                'status': 'success',
                'data': {
                    'info': data['info'],
                    'position': data['positions'][0]
                }
            })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        })

if __name__ == '__main__':
    app.run(debug=True)