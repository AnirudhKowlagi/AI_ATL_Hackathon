import React, { useState } from "react";
import axios from "axios";

export default function ImgUpload(props) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const username = localStorage.getItem("username");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file first!");
      return;
    }

    try {
      // STEP 1: Fetch user location from Node server
      const locResponse = await axios.get(`http://localhost:3000/getLocation/${username}?limit=1`);

      // Get the most recent location
      const { latitude, longitude } = locResponse.data.locations[0];
      console.log("Fetched user location:", latitude, longitude);

      // STEP 2: Build form data for Flask
      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("tire_age", props.tireAge || 2);
      formData.append("miles_driven", props.mileage || 5000);
      formData.append("lat", latitude);
      formData.append("lon", longitude);

      // STEP 3: Send to Flask endpoint
      const response = await axios.post("http://127.0.0.1:5000/tire-estimate", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Tire analysis result:", response.data);
      const returnObject = {
        result: response.data.tire_quality,
        miles: response.data.estimated_remaining_miles,
        surface_counts: response.data.surface_counts,
        score: response.data.total_score,
        latitude: latitude,
        longitude: longitude
      };

      // STEP 4: Navigate to results page
      props.onCheckClick(returnObject);

    } catch (error) {
      console.error("Error analyzing tire:", error);
      alert("Failed to analyze tire. Check the console for details.");
    }

    console.log("Uploading file:", selectedFile);
  };

  return (
    <div
      style={{
        background: "linear-gradient(145deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02))",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.15)",
        borderRadius: "16px",
        padding: "2rem",
        maxWidth: "500px",
        margin: "0 auto",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
      }}
    >
      <h5 style={{
        fontSize: "1.5rem",
        fontWeight: "600",
        marginBottom: "0.75rem",
        background: "linear-gradient(135deg, #ff9a56, #ffb380)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text"
      }}>
        Upload Tire Image
      </h5>
      <p style={{
        color: "rgba(248, 240, 227, 0.7)",
        marginBottom: "1.5rem",
        fontSize: "0.95rem"
      }}>
        Select an image of the tire to feed into our model.
      </p>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          border: isDragging
            ? "2px dashed rgba(255, 154, 86, 0.6)"
            : "2px dashed rgba(255, 255, 255, 0.2)",
          borderRadius: "12px",
          padding: "2rem",
          textAlign: "center",
          backgroundColor: isDragging
            ? "rgba(255, 154, 86, 0.05)"
            : "rgba(255, 255, 255, 0.03)",
          transition: "all 0.3s ease",
          cursor: "pointer",
          marginBottom: "1.5rem"
        }}
        onClick={() => document.getElementById('fileInput').click()}
      >
        {!previewUrl ? (
          <div>
            <svg
              style={{ width: "48px", height: "48px", margin: "0 auto 1rem", opacity: 0.6 }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p style={{ margin: "0", color: "rgba(248, 240, 227, 0.9)", fontWeight: "500" }}>
              Drag & drop or click to upload
            </p>
            <p style={{ margin: "0.5rem 0 0", fontSize: "0.85rem", color: "rgba(248, 240, 227, 0.5)" }}>
              PNG, JPG up to 10MB
            </p>
          </div>
        ) : (
          <div>
            <img
              src={previewUrl}
              alt="Preview"
              style={{
                maxWidth: "100%",
                maxHeight: "200px",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)"
              }}
            />
          </div>
        )}
      </div>

      <input
        id="fileInput"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      {selectedFile && (
        <div style={{
          marginBottom: "1.5rem",
          padding: "0.75rem",
          background: "rgba(255, 255, 255, 0.05)",
          borderRadius: "8px",
          fontSize: "0.9rem"
        }}>
          <span style={{ color: "rgba(248, 240, 227, 0.7)" }}>Selected:</span>{" "}
          <span style={{ color: "#ffb380", fontWeight: "500" }}>{selectedFile.name}</span>
        </div>
      )}

      <button
        onClick={handleUpload}
        style={{
          width: "100%",
          padding: "0.875rem",
          background: "linear-gradient(135deg, #ff9a56, #ff7e3a)",
          border: "none",
          borderRadius: "10px",
          color: "white",
          fontSize: "1rem",
          fontWeight: "600",
          cursor: "pointer",
          transition: "all 0.3s ease",
          boxShadow: "0 4px 15px rgba(255, 154, 86, 0.3)"
        }}
        onMouseOver={(e) => {
          e.target.style.transform = "translateY(-2px)";
          e.target.style.boxShadow = "0 6px 20px rgba(255, 154, 86, 0.4)";
        }}
        onMouseOut={(e) => {
          e.target.style.transform = "translateY(0)";
          e.target.style.boxShadow = "0 4px 15px rgba(255, 154, 86, 0.3)";
        }}
      >
        Analyze Tire
      </button>
    </div>
  );
}

