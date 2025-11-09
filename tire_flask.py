from flask import Flask, request, jsonify
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import io
import pandas as pd
import math
import geopandas as gpd
from shapely.geometry import shape, Point
import requests

app = Flask(__name__)

###############################################
# 1. Load Model and Define Preprocessing
###############################################

# Same transform you used for prediction
transform = transforms.Compose([
    transforms.Resize((224,224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485,0.456,0.406],
                         std=[0.229,0.224,0.225])
])

# Load model architecture exactly as in your notebook
model = models.resnet50(weights=None)
model.fc = nn.Linear(model.fc.in_features, 2)
model.load_state_dict(torch.load("tire_classifier.pth", map_location="cpu"))
model.eval()


###############################################
# 2. Tire Classification Endpoint
###############################################
'''
@app.route("/classify-tire", methods=["POST"])
def classify_tire():
    if "image" not in request.files:
        return jsonify({"error": "No image provided"}), 400

    img_file = request.files["image"]
    img = Image.open(io.BytesIO(img_file.read())).convert("RGB")

    img_tensor = transform(img).unsqueeze(0)

    with torch.no_grad():
        output = model(img_tensor)
        pred = output.argmax(1).item()

    if pred == 1:
        label = "the tire is good"
    else: 
        label = "the tire should be replaced"

    return jsonify({"classification": label})
'''

###############################################
# 3. Load Surface Dataset
###############################################

# Expecting CSV columns: latitude, longitude, surface_typevd
surface_df = pd.read_csv("Road_Surface_Type.csv")

url = "https://maps.itos.uga.edu/arcgis/rest/services/GDOT/GDOT_FunctionalClass/MapServer/0/query?where=1%3D1&outFields=*&f=geojson"
response = requests.get(url)
data = response.json()

features = data['features']
geoms = [shape(feat['geometry']) for feat in features]
properties = [feat['properties'] for feat in features]

routes_gdf = gpd.GeoDataFrame(properties, geometry=geoms, crs="EPSG:4326")
routes_gdf = routes_gdf.to_crs(epsg=32616)  # UTM Zone 16N for distance in meters

surface_df['routeID_numeric'] = surface_df['RouteId'].str.extract(r'(\d+)').astype(int)
@app.route("/tire-estimate", methods=["POST"])
def tire_estimate():
    # -----------------------------
    # Required inputs
    # -----------------------------
    if "image" not in request.files:
        return jsonify({"error": "No image provided"}), 400

    img_file = request.files["image"]
    tire_age = request.form.get("tire_age")
    miles_driven = request.form.get("miles_driven")
    lat = request.form.get("lat")
    lon = request.form.get("lon")

    # Validate inputs
    if not all([tire_age, miles_driven, lat, lon]):
        return jsonify({"error": "Missing one of the required parameters: tire_age, miles_driven, lat, lon"}), 400

    tire_age = float(tire_age)
    miles_driven = float(miles_driven)
    lat = float(lat)
    lon = float(lon)

    # -----------------------------
    # 1. Classify tire quality
    # -----------------------------
    img = Image.open(io.BytesIO(img_file.read())).convert("RGB")
    img_tensor = transform(img).unsqueeze(0)

    with torch.no_grad():
        output = model(img_tensor)
        pred = output.argmax(1).item()

    tire_quality = "the tire is good" if pred == 1 else "the tire should be replaced"

    # -----------------------------
    # 2. Surface counts within 20 miles
    # -----------------------------
    user_point = Point(lon, lat)
    user_point_proj = gpd.GeoSeries([user_point], crs="EPSG:4326").to_crs(epsg=32616).iloc[0]

    routes_gdf['distance_meters'] = routes_gdf.geometry.apply(lambda geom: geom.distance(user_point_proj))
    nearest_route = routes_gdf.loc[routes_gdf['distance_meters'].idxmin()]
    line = nearest_route.geometry

    fraction_along = line.project(user_point_proj) / line.length
    from_measure = nearest_route.get('from_measure', 0)
    to_measure = nearest_route.get('to_measure', line.length)
    milepost = from_measure + fraction_along * (to_measure - from_measure)

    route_id_numeric = int(''.join(filter(str.isdigit, nearest_route['route_id'])))
    route_segments = surface_df[surface_df['routeID_numeric'] == route_id_numeric]
    segments_within_20 = route_segments[
        (route_segments['EndPoint'] >= milepost - 20) &
        (route_segments['BeginPoint'] <= milepost + 20)
    ]

    surface_counts = {2:0, 3:0, 5:0, 7:0, 11:0}
    for _, row in segments_within_20.iterrows():
        stype = int(row['SURFACE_TYPEVn'])
        if stype in surface_counts:
            surface_counts[stype] += 1

    # -----------------------------
    # 3. Calculate total score
    # -----------------------------
    weights = {"quality":0.35, "age":0.25, "miles":0.25, "surface":0.15}
    quality_score = 1.0 if tire_quality == "the tire is good" else 0.1
    age_score = max(0, 1 - (tire_age / 10))
    miles_score = max(0, 1 - (miles_driven / 90000))
    surface_scores_map = {2:1.0, 3:0.9, 5:0.7, 7:0.7, 11:0.5}

    total_segments = sum(surface_counts.values()) or 1
    surface_score = sum(surface_counts[s] * surface_scores_map.get(s, 0.7) 
                        for s in surface_counts) / total_segments

    total_score = (
        quality_score*weights["quality"] +
        age_score*weights["age"] +
        miles_score*weights["miles"] +
        surface_score*weights["surface"]
    )

    rem_miles = int(total_score * 90000)

    # -----------------------------
    # 4. Return results
    # -----------------------------
    return jsonify({
        "tire_quality": tire_quality,
        "total_score": round(total_score, 2),
        "estimated_remaining_miles": rem_miles,
        "surface_counts": surface_counts
    })



'''
surface_df['routeID_numeric'] = surface_df['RouteId'].str.extract(r'(\d+)').astype(int)
@app.route("/surfaces-within-20-miles", methods=["GET"])
def surfaces_within_radius():
    try:
        lat = float(request.args.get("lat"))
        lon = float(request.args.get("lon"))
    except:
        return jsonify({"error": "Missing or invalid lat/lon parameters"}), 400

    user_point = Point(lon, lat)
    user_point_proj = gpd.GeoSeries([user_point], crs="EPSG:4326").to_crs(epsg=32616).iloc[0]

    # 1. Find nearest route to user point
    routes_gdf['distance_meters'] = routes_gdf.geometry.apply(lambda geom: geom.distance(user_point_proj))
    nearest_route = routes_gdf.loc[routes_gdf['distance_meters'].idxmin()]
    line = nearest_route.geometry

    # 2. Compute fraction along line
    fraction_along = line.project(user_point_proj) / line.length

    # Use GeoJSON from/to measures if available
    from_measure = nearest_route.get('from_measure', 0)
    to_measure = nearest_route.get('to_measure', line.length)

    # 3. Compute milepost along the route
    milepost = from_measure + fraction_along * (to_measure - from_measure)

    # 4. Filter surface segments for this route
    route_id_numeric = int(''.join(filter(str.isdigit, nearest_route['route_id'])))
    route_segments = surface_df[surface_df['routeID_numeric'] == route_id_numeric]

    # 5. Find all segments within ±20 miles
    segments_within_20 = route_segments[
        (route_segments['EndPoint'] >= milepost - 20) &
        (route_segments['BeginPoint'] <= milepost + 20)
    ]

    # 6. Build response
    results = []
    for _, row in segments_within_20.iterrows():
        results.append({
            #"begin_milepost": row['BeginPoint'],
            #"end_milepost": row['EndPoint'],
            "surface_typevn": int(row['SURFACE_TYPEVn'])
        })

    return jsonify({
        "input_location": {"lat": lat, "lon": lon},
        "count": len(results),
        "results": results
    })
'''
###############################################
# Run Flask App
###############################################

if __name__ == "__main__":
    app.run(debug=True)
