import React from "react";

export default function CarList(props) {
  return (
    <div className="px-4 py-5 my-5 text-center">

      <h1
        className="display-5 fw-bold"
        style={{
          color: "#f8f0e3",
          textShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
          fontSize: "2.5rem",
          letterSpacing: "-0.5px",
          marginBottom: "3rem"
        }}
      >
        Add Your Cars Here
      </h1>

      <div className="col-lg-6 mx-auto mt-5">

        <div className="d-grid gap-3 d-sm-flex flex-column justify-content-sm-center align-items-center">
          {props.cars.map((car, idx) => (
            <div
              key={idx}
              style={{
                background: "linear-gradient(145deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.03))",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.18)",
                color: "#f8f0e3",
                fontSize: "1rem",
                padding: "20px 28px",
                borderRadius: "16px",
                width: "676px",
                textAlign: "left",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                marginBottom: "16px",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                cursor: "pointer",
              }}

              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 12px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)";
              }}

              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)";
              }}

              onClick={() => props.onCarClick(car)}
            >
              <div style={{
                fontSize: "1.25rem",
                fontWeight: "600",
                marginBottom: "12px",
                background: "linear-gradient(135deg, #ff9a56, #ffb380)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                
              }}>
                {car.make} {car.model} ({car.year})
              </div>

              <div style={{
                display: "flex",
                gap: "20px",
                fontSize: "0.95rem"
              }}>
                <div style={{
                  flex: 1,
                  padding: "8px 12px",
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "8px",
                  border: "1px solid rgba(255, 255, 255, 0.1)"
                }}>
                  <div style={{ fontSize: "0.75rem", color: "rgba(248, 240, 227, 0.6)", marginBottom: "2px" }}>
                    Tire Age
                  </div>
                  <div style={{ fontWeight: "600", color: "#ffb380" }}>
                    {car.tireAge}
                  </div>
                </div>

                <div style={{
                  flex: 1,
                  padding: "8px 12px",
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "8px",
                  border: "1px solid rgba(255, 255, 255, 0.1)"
                }}>
                  <div style={{ fontSize: "0.75rem", color: "rgba(248, 240, 227, 0.6)", marginBottom: "2px" }}>
                    Miles Driven
                  </div>
                  <div style={{ fontWeight: "600", color: "#ffb380" }}>
                    {car.mileage}
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => props.onAddClick()}
            style={{
              background: "linear-gradient(145deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02))",
              border: "2px dashed rgba(255, 154, 86, 0.3)",
              backdropFilter: "blur(20px)",
              height: "80px",
              width: "676px",
              WebkitBackdropFilter: "blur(20px)",
              color: "#ffb380",
              fontSize: "1.1rem",
              fontWeight: "600",
              padding: "12px 36px",
              borderRadius: "16px",
              transition: "all 0.3s ease",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px"
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "linear-gradient(145deg, rgba(255, 154, 86, 0.15), rgba(255, 154, 86, 0.05))";
              e.target.style.borderColor = "rgba(255, 154, 86, 0.5)";
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 6px 20px rgba(255, 154, 86, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "linear-gradient(145deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02))";
              e.target.style.borderColor = "rgba(255, 154, 86, 0.3)";
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "none";
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add New Vehicle
          </button>
        </div>
      </div>
    </div>

  )
}