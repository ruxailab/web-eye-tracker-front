# for mock frontend testing without backend server creation


from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import json

app = Flask(__name__)
CORS(app)

@app.route('/api/session/calib_validation', methods=['POST'])
def calibration_validation():
    try:
        # Get data from request
        file_name = json.loads(request.form.get('file_name'))
        fixed_points = json.loads(request.form.get('fixed_circle_iris_points'))
        calib_points = json.loads(request.form.get('calib_circle_iris_points'))
        screen_height = json.loads(request.form.get('screen_height'))
        screen_width = json.loads(request.form.get('screen_width'))
        k = json.loads(request.form.get('k'))
        
        # Process calibration data
        result = {}
        for point in fixed_points:
            x = str(int(float(point['point_x'])))
            y = str(int(float(point['point_y'])))
            
            if x not in result:
                result[x] = {}
            
            if y not in result[x]:
                result[x][y] = {
                    'PrecisionSD': np.random.uniform(0.5, 2.0),  # Mock precision
                    'Accuracy': np.random.uniform(1.0, 5.0),     # Mock accuracy
                    'predicted_x': [float(point['point_x']) + np.random.normal(0, 10) for _ in range(5)],
                    'predicted_y': [float(point['point_y']) + np.random.normal(0, 10) for _ in range(5)]
                }
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000) 