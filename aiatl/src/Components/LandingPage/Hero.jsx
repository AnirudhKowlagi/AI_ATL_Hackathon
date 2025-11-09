import React from "react";

export default function Hero(props) {
  return (
    <div className="container-fluid" style={{ padding: 0, overflow: "hidden", overflowY: "hidden"}}>
      <div className="card text-center" style={{ position: "relative" }}>

        {/* Background image with blur */}
        <img
          src="/Assets/TireBackground.jpeg"
          alt="Background"
          style={{
            width: "100%",
            height: "100vh",
            objectFit: "cover",
            filter: "blur(5px) brightness(60%)",
            transform: "scale(1.1)",
            border: "none",          
            boxShadow: "none",       
            display: "block",        
          }}
        />

        {/* Overlay text */}
        <div
          className="card-img-overlay d-flex flex-column justify-content-center align-items-center"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            color: "white",
            background: "transparent",
            border: "none",
            boxShadow: "none",
          }}
        >
          <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", marginBottom: "1rem" }}>
            Smarter Tires. Safer Drives 
          </h1>
          <div className="d-flex gap-4">
            <button className="btn btn-outline-light btn-lg" onClick={() => props.loginClick("Login")}>Login</button>
            <button className="btn btn-primary btn-lg" onClick={() => props.loginClick("SignUp")}>Sign-up</button>
          </div>
        </div>
      </div>
    </div>
  );
}
