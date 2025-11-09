import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import DHeader from "../Components/Dashboard/DHeader";
import StaticMap from "../Components/Result/StaticMap";

export default function Result() {
  const { state } = useLocation();

  const [result, setResult] = useState("");
  const [milesToPuncture, setMilesToPuncture] = useState(0);
  const [userLocation, setUserLocation] = useState(null);
  const [surfaceCounts, setSurfaceCounts] = useState({});
  const [tireQualityScore, setTireQualityScore] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    if (state) {
      setResult(state.result);
      setMilesToPuncture(state.milesToPuncture);
      setUserLocation(state.userLocation);
      setSurfaceCounts(state.surfaceCounts || {});
      setTireQualityScore(state.totalScore || 0);
    }
  }, [state]);

  const toggleChat = () => setShowChat(!showChat);

  const handleSend = async () => {
    if (!message.trim()) return;

    setChatHistory(prev => [...prev, { sender: "user", text: message }]);

    try {
      const response = await fetch("http://localhost:3000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      });

      const data = await response.json();

      if (data.success && data.answer) {
        setChatHistory(prev => [...prev, { sender: "bot", text: data.answer }]);
      } else {
        setChatHistory(prev => [...prev, { sender: "bot", text: "⚠️ Error: No answer returned" }]);
      }
    } catch (err) {
      console.error(err);
      setChatHistory(prev => [...prev, { sender: "bot", text: "⚠️ Error: Could not connect to server." }]);
    }

    setMessage("");
  };

  const getSurfaceLabel = (key) => {
    const labels = {
      "2": "Asphalt",
      "3": "Concrete",
      "5": "Other",
      "7": "Other",
      "11": "Unpaved"
    };
    return labels[key] || "Unknown";
  };

  const getQualityColor = (score) => {
    if (score >= 0.8) return "#4caf50";
    if (score >= 0.6) return "#8bc34a";
    if (score >= 0.4) return "#ffeb3b";
    if (score >= 0.2) return "#ff9800";
    return "#ff6b6b";
  };

  if (!userLocation) return <div>Loading...</div>;

  const totalSurface = Object.values(surfaceCounts).reduce((a, b) => a + b, 0);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        position: "relative",
        overflowY: "auto",
        color: "#f8f0e3",
      }}
    >
      {/* Gradient background */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(ellipse 1000px 500px at 85% 25%, rgba(220, 150, 70, 0.5) 0%, transparent 60%),
            radial-gradient(ellipse 700px 400px at 75% 15%, rgba(200, 135, 65, 0.4) 0%, transparent 55%),
            radial-gradient(ellipse 900px 600px at 15% 35%, rgba(50, 55, 65, 0.7) 0%, transparent 60%),
            radial-gradient(ellipse 600px 450px at 25% 55%, rgba(45, 50, 60, 0.65) 0%, transparent 55%),
            radial-gradient(ellipse 800px 400px at 65% 65%, rgba(180, 120, 55, 0.35) 0%, transparent 58%),
            radial-gradient(ellipse 500px 350px at 45% 80%, rgba(40, 45, 55, 0.5) 0%, transparent 50%)
          `,
          filter: "blur(67px)",
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>
        <DHeader context="Image" />

        <div
          className="d-flex flex-column align-items-center"
          style={{
            minHeight: "100vh",
            padding: "60px 20px",
            color: "#f8f0e3",
          }}
        >
          <h1
            className="display-5 fw-bold mb-5"
            style={{
              color: "#f8f0e3",
              textShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
              fontSize: "2.5rem",
              letterSpacing: "-0.5px"
            }}
          >
            Analysis Results
          </h1>

          {/* --- MAIN CARD --- */}
          <div
            style={{
              background: "linear-gradient(145deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.03))",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.18)",
              color: "#f8f0e3",
              fontSize: "1.3rem",
              padding: "32px 48px",
              borderRadius: "20px",
              width: "900px",
              textAlign: "center",
              marginBottom: "30px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
              transition: "transform 0.3s ease",
            }}
          >
            <h2 style={{
              fontWeight: "600",
              marginBottom: "16px",
              background: "linear-gradient(135deg, #ff9a56, #ffb380)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text"
            }}>
              Tire Condition
            </h2>
            <p
              style={{
                fontSize: "1.8rem",
                color: result === "the tire is good" ? "#4caf50" : "#ff6b6b",
                fontWeight: "bold",
                marginBottom: "0"
              }}
            >
              {result === "the tire is good" ? "Good to Go" : "Needs Replacement"}
            </p>
          </div>

          {/* --- TOP ROW: Quality Score & Miles --- */}
          <div
            className="d-flex flex-row justify-content-center gap-4 flex-wrap"
            style={{ width: "900px", marginBottom: "30px" }}
          >
            {/* Tire Quality Score */}
            <div
              style={{
                background: "linear-gradient(145deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.03))",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.18)",
                color: "#f8f0e3",
                fontSize: "1.1rem",
                padding: "24px 32px",
                borderRadius: "16px",
                flex: 1,
                minWidth: "280px",
                textAlign: "center",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
              }}
            >
              <h4 style={{
                marginBottom: "12px",
                fontSize: "1.1rem",
                color: "rgba(248, 240, 227, 0.8)"
              }}>
                Tire Quality Score
              </h4>
              <div style={{
                fontSize: "3rem",
                fontWeight: "bold",
                color: getQualityColor(tireQualityScore),
                marginBottom: "8px"
              }}>
                {result === "the tire is good" ? (tireQualityScore * 100).toFixed(0) : (tireQualityScore * 100 - 30).toFixed(0)}
              </div>
              <div style={{
                fontSize: "0.9rem",
                color: "rgba(248, 240, 227, 0.6)"
              }}>
                out of 100
              </div>
            </div>

            {/* Miles to Puncture */}
            <div
              style={{
                background: "linear-gradient(145deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.03))",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.18)",
                color: "#f8f0e3",
                fontSize: "1.1rem",
                padding: "24px 32px",
                borderRadius: "16px",
                flex: 1,
                minWidth: "280px",
                textAlign: "center",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
              }}
            >
              <h4 style={{
                marginBottom: "12px",
                fontSize: "1.1rem",
                color: "rgba(248, 240, 227, 0.8)"
              }}>
                Estimated Tire Life Span
              </h4>
              <div style={{
                fontSize: "3rem",
                fontWeight: "bold",
                color: "#ffcc00",
                marginBottom: "8px"
              }}>
                {result === "the tire is good" ? milesToPuncture : milesToPuncture - 30000}
              </div>
              <div style={{
                fontSize: "0.9rem",
                color: "rgba(248, 240, 227, 0.6)"
              }}>
                miles remaining
              </div>
            </div>
          </div>

          {/* --- BOTTOM ROW: Surface Counts & Map --- */}
          <div
            className="d-flex flex-row justify-content-center gap-4 flex-wrap"
            style={{ width: "900px" }}
          >
            {/* Surface Counts */}
            <div
              style={{
                background: "linear-gradient(145deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.03))",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.18)",
                borderRadius: "16px",
                width: "430px",
                padding: "24px",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
              }}
            >
              <h4 style={{
                marginBottom: "16px",
                textAlign: "center",
                fontSize: "1.2rem",
                background: "linear-gradient(135deg, #ff9a56, #ffb380)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text"
              }}>
                Road Surface Distribution
              </h4>
              <div style={{
                fontSize: "0.85rem",
                color: "rgba(248, 240, 227, 0.6)",
                textAlign: "center",
                marginBottom: "16px"
              }}>
                Within 20 mile radius
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {Object.entries(surfaceCounts).map(([key, value]) => {
                  const percentage = totalSurface > 0 ? ((value / totalSurface) * 100).toFixed(1) : 0;
                  return (
                    <div key={key} style={{
                      background: "rgba(255, 255, 255, 0.05)",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
                        <span style={{
                          fontWeight: "600",
                          color: "#ffb380",
                          minWidth: "80px"
                        }}>
                          {getSurfaceLabel(key)}
                        </span>
                        <div style={{
                          flex: 1,
                          height: "8px",
                          background: "rgba(255, 255, 255, 0.1)",
                          borderRadius: "4px",
                          overflow: "hidden"
                        }}>
                          <div style={{
                            width: `${percentage}%`,
                            height: "100%",
                            background: "linear-gradient(90deg, #ff9a56, #ffb380)",
                            borderRadius: "4px"
                          }} />
                        </div>
                      </div>
                      <span style={{
                        fontSize: "0.9rem",
                        color: "rgba(248, 240, 227, 0.7)",
                        minWidth: "50px",
                        textAlign: "right"
                      }}>
                        {percentage}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Map Card */}
            <div
              style={{
                background: "linear-gradient(145deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.03))",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.18)",
                borderRadius: "16px",
                width: "430px",
                overflow: "hidden",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                display: "flex",
                flexDirection: "column"
              }}
            >
              <div style={{
                padding: "16px 24px",
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
              }}>
                <h4 style={{
                  marginBottom: "4px",
                  fontSize: "1.2rem",
                  background: "linear-gradient(135deg, #ff9a56, #ffb380)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  textAlign: "center"
                }}>
                  Your Location
                </h4>
                <div style={{
                  fontSize: "0.85rem",
                  color: "rgba(248, 240, 227, 0.6)",
                  textAlign: "center"
                }}>
                  20 mile radius road conditions
                </div>
              </div>
              <div style={{ flex: 1, minHeight: "280px" }}>
                <StaticMap lat={userLocation.lat} lon={userLocation.lon} />
              </div>
            </div>
          </div>
        </div>

        {/* --- SIMULATOR BUTTON --- */}
        <a
          href="https://anirudhkowlagi.github.io/AI_ATL_Hackathon/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            position: "fixed",
            bottom: "30px",
            left: "30px",
            background: "linear-gradient(135deg, #4a90e2, #357abd)",
            border: "none",
            borderRadius: "12px",
            padding: "14px 28px",
            color: "#fff",
            fontSize: "1rem",
            fontWeight: "600",
            cursor: "pointer",
            boxShadow: "0 6px 20px rgba(74, 144, 226, 0.4)",
            zIndex: 10,
            transition: "all 0.3s ease",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.boxShadow = "0 8px 25px rgba(74, 144, 226, 0.5)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(74, 144, 226, 0.4)";
          }}
        >
          
          Simulator
        </a>

        {/* --- CHATBOT BUTTON --- */}
        <button
          onClick={toggleChat}
          style={{
            position: "fixed",
            bottom: "30px",
            right: "30px",
            background: "linear-gradient(135deg, #ff9a56, #ff7e3a)",
            border: "none",
            borderRadius: "50%",
            width: "65px",
            height: "65px",
            color: "#fff",
            fontSize: "1.8rem",
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 6px 20px rgba(255, 154, 86, 0.4)",
            zIndex: 10,
            transition: "all 0.3s ease"
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = "translateY(-4px) scale(1.05)";
            e.currentTarget.style.boxShadow = "0 8px 25px rgba(255, 154, 86, 0.5)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = "translateY(0) scale(1)";
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(255, 154, 86, 0.4)";
          }}
        >
          
        </button>

        {/* --- CHAT MODAL --- */}
        {showChat && (
          <div
            style={{
              position: "fixed",
              bottom: "110px",
              right: "40px",
              width: "380px",
              height: "500px",
              background: "linear-gradient(145deg, rgba(30, 30, 35, 0.98), rgba(20, 20, 25, 0.98))",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "20px",
              boxShadow: "0 12px 40px rgba(0, 0, 0, 0.6)",
              backdropFilter: "blur(20px)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              overflow: "hidden",
              zIndex: 11,
              animation: "fadeIn 0.3s ease",
            }}
          >
            {/* Chat Header */}
            <div
              style={{
                padding: "16px 20px",
                background: "linear-gradient(135deg, rgba(255, 154, 86, 0.2), rgba(255, 154, 86, 0.1))",
                borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                color: "#f8f0e3",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "1.5rem" }}>🛞</span>
                <span style={{ fontWeight: "600", fontSize: "1.1rem" }}>AI Tire Assistant</span>
              </div>
              <button
                onClick={toggleChat}
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "none",
                  color: "#f8f0e3",
                  fontSize: "1.3rem",
                  cursor: "pointer",
                  width: "28px",
                  height: "28px",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s ease"
                }}
                onMouseOver={(e) => e.target.style.background = "rgba(255, 255, 255, 0.2)"}
                onMouseOut={(e) => e.target.style.background = "rgba(255, 255, 255, 0.1)"}
              >
                ✕
              </button>
            </div>

            {/* Chat Messages */}
            <div
              style={{
                flex: 1,
                padding: "16px",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              {chatHistory.length === 0 && (
                <div style={{
                  textAlign: "center",
                  color: "rgba(248, 240, 227, 0.5)",
                  padding: "20px",
                  fontSize: "0.9rem"
                }}>
                  Ask me anything about your tire condition!
                </div>
              )}
              {chatHistory.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                    background: msg.sender === "user"
                      ? "linear-gradient(135deg, #ff9a56, #ff7e3a)"
                      : "rgba(255, 255, 255, 0.08)",
                    color: msg.sender === "user" ? "#fff" : "#f8f0e3",
                    padding: "10px 14px",
                    borderRadius: "14px",
                    maxWidth: "75%",
                    fontSize: "0.95rem",
                    lineHeight: "1.4",
                    boxShadow: msg.sender === "user"
                      ? "0 2px 8px rgba(255, 154, 86, 0.3)"
                      : "0 2px 8px rgba(0, 0, 0, 0.2)"
                  }}
                >
                  {msg.text}
                </div>
              ))}
            </div>

            {/* Input */}
            <div
              style={{
                display: "flex",
                borderTop: "1px solid rgba(255, 255, 255, 0.2)",
                padding: "12px",
                gap: "8px",
                background: "rgba(255, 255, 255, 0.02)"
              }}
            >
              <input
                type="text"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                style={{
                  flex: 1,
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  color: "#f8f0e3",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  outline: "none",
                  fontSize: "0.95rem"
                }}
              />
              <button
                onClick={handleSend}
                style={{
                  background: "linear-gradient(135deg, #ff9a56, #ff7e3a)",
                  border: "none",
                  borderRadius: "10px",
                  padding: "10px 18px",
                  color: "#fff",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  boxShadow: "0 2px 8px rgba(255, 154, 86, 0.3)"
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = "scale(1.05)";
                  e.target.style.boxShadow = "0 4px 12px rgba(255, 154, 86, 0.4)";
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = "scale(1)";
                  e.target.style.boxShadow = "0 2px 8px rgba(255, 154, 86, 0.3)";
                }}
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}