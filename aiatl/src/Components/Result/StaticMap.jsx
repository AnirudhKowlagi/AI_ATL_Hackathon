import React, { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function StaticMap({ lat, lon }) {
  useEffect(() => {
    const map = L.map("map-container", {
      center: [lat, lon],
      zoom: 9,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        maxZoom: 18,
      }
    ).addTo(map);

    L.circle([lat, lon], {
      color: "#ffcc00",
      fillColor: "#ffcc00",
      fillOpacity: 0.25,
      radius: 32000,
      weight: 2,
    }).addTo(map);

    return () => map.remove();
  }, [lat, lon]);

  return (
    <div
      id="map-container"
      style={{
        width: "100%",
        height: "100%",
        borderRadius: "20px",
      }}
    />
  );
}
