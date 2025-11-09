import React from "react";
import { useNavigate } from "react-router-dom";
import ImgUpload from "./ImgUpload";

export default function ImgDashboard(props) {
  const navigateTo = useNavigate();

  function goToResult(results) {
    console.log("Triggered result");
    console.log(props.car.latitude);
    navigateTo("/result", {
      state: {
        result: results.result,
        milesToPuncture: results.miles,
        surfaceCounts: results.surface_counts,
        totalScore: results.score,
        userLocation: {
          lat: results.latitude,
          lon: results.longitude
        }
      }
    })
  }

  return (
    <div
      className="d-flex flex-column align-items-center"
      style={{ marginTop: "40px", paddingBottom: "40px", minHeight: "100vh" }}
    >
      <h1
        className="display-5 fw-bold mb-5"
        style={{
          color: "#f8f0e3",
          textShadow: "0 2px 10px rgba(0, 0, 0, 0.3)"
        }}
      >
        Tire Check
      </h1>
      <div
        style={{
          background: "linear-gradient(145deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.03))",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.18)",
          color: "#f8f0e3",
          fontSize: "1rem",
          padding: "32px 40px",
          borderRadius: "20px",
          width: "700px",
          textAlign: "center",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
          marginBottom: "20px",
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = "translateY(-4px)";
          e.currentTarget.style.boxShadow = "0 12px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)";
        }}
      >
        <h2 style={{
          marginBottom: "20px",
          fontSize: "1.75rem",
          fontWeight: "600",
          background: "linear-gradient(135deg, #ff9a56, #ffb380)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text"
        }}>
          {props.car.make} {props.car.model} ({props.car.year})
        </h2>

        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px",
          marginBottom: "24px",
          textAlign: "left"
        }}>
          <div style={{
            padding: "12px 16px",
            background: "rgba(255, 255, 255, 0.05)",
            borderRadius: "10px",
            border: "1px solid rgba(255, 255, 255, 0.1)"
          }}>
            <div style={{ fontSize: "0.8rem", color: "rgba(248, 240, 227, 0.6)", marginBottom: "4px" }}>
              Tire Age
            </div>
            <div style={{ fontSize: "1.1rem", fontWeight: "600", color: "#ffb380" }}>
              {props.car.tireAge}
            </div>
          </div>

          <div style={{
            padding: "12px 16px",
            background: "rgba(255, 255, 255, 0.05)",
            borderRadius: "10px",
            border: "1px solid rgba(255, 255, 255, 0.1)"
          }}>
            <div style={{ fontSize: "0.8rem", color: "rgba(248, 240, 227, 0.6)", marginBottom: "4px" }}>
              Miles Driven
            </div>
            <div style={{ fontSize: "1.1rem", fontWeight: "600", color: "#ffb380" }}>
              {props.car.mileage}
            </div>
          </div>

        
        </div>

        <div style={{ marginTop: "24px" }}>
          <ImgUpload onCheckClick={goToResult} latitude={props.userLat} longitude={props.userLon} tireAge={props.tireAge} mileage={props.mileage}/>
        </div>
      </div>
    </div>
  );
}