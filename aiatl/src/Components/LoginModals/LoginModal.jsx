import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginModal(props) {
  const navigateTo = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [useLocation, setUseLocation] = useState(false);

  async function goToDashboard(e) {
    e.preventDefault();
    let loc = null;

    if (useLocation && navigator.geolocation) {
      try {
        const position = await new Promise((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject)
        );
        if (position) {
          loc = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
        }
      } catch (error) {
        alert("Error getting location:", error);
      }
    }

    try {
      const response = await axios.post("http://localhost:3000/signup", {
        username: email,
        password,
        locationOptIn: useLocation,
        latitude: loc?.latitude || null,
        longitude: loc?.longitude || null,
      });

      if (response.data?.username) {
        localStorage.setItem("username", response.data.username);
      }
    } catch (err) {
      console.error("Error sending signup:", err);
    }

    navigateTo("/dashboard");
  }

  async function goToDashboardLogin(e) {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:3000/login", {
        username: email,
        password,
      });

      if (response.data?.username) {
        localStorage.setItem("username", response.data.username);
        navigateTo("/dashboard");
      } else {
        alert("Login failed: Invalid credentials");
      }
    } catch (err) {
      console.error("Error logging in:", err);
      alert("Login failed: Could not connect to server");
    }
  }

  return (
    <AnimatePresence style={{ backgroundColor: "#1a1a1a", color: "white" }}>
      {props.show && (
        <motion.div
          onClick={props.close}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "2rem",
              width: "100%",
              maxWidth: "400px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h2>{props.type === "Login" ? "Log In" : "Sign Up"}</h2>
              <button
                onClick={props.close}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.2rem",
                  cursor: "pointer",
                }}
              >
                &times;
              </button>
            </div>

            <form>
              <div className="form-floating mb-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-control rounded-3"
                  placeholder="name@example.com"
                />
                <label>Email address</label>
              </div>

              <div className="form-floating mb-3">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-control rounded-3"
                  placeholder="Password"
                />
                <label>Password</label>
              </div>

              {props.type === "SignUp" && (
                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={useLocation}
                    onChange={(e) => setUseLocation(e.target.checked)}
                  />
                  <label className="form-check-label">
                    Allow us to use your location
                  </label>
                </div>
              )}

              <button
                className="w-100 mb-2 btn btn-lg rounded-3 btn-primary"
                type="submit"
                onClick={props.type === "Login" ? goToDashboardLogin : goToDashboard}
              >
                {props.type === "Login" ? "Log In" : "Sign Up"}
              </button>

              {props.type === "SignUp" && (
                <small className="text-muted">
                  By clicking Sign up, you agree to the terms of use.
                </small>
              )}
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
