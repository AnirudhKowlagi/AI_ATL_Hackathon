import React from "react";
import { useState } from "react";
import { useEffect } from "react";

export default function FormModal(props) {
  if (!props.show) return null;

  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [age, setAge] = useState("");
  const [milesDriven, setMilesDriven] = useState("");
  const [drivingConditions, setDrivingConditions] = useState("")

  function handleMakeChange(e){
    const newValue = e.target.value;
    setMake(newValue)
  }

  function handleModelChange(e){
    const newValue = e.target.value;
    setModel(newValue)
  }

  function handleYearChange(e){
    const newValue = e.target.value;
    setYear(newValue)
  }

  function handleAgeChange(e){
    const newValue = e.target.value;
    setAge(newValue)
  }

  function handleDrivingChange(e){
    const newValue = e.target.value;
    setDrivingConditions(newValue)
  }

  function handleMilesChange(e){
    const newValue = e.target.value;
    setMilesDriven(newValue);
  }

  return (
    <div
      className="modal fade show"
      style={{
        display: "block",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        color: "white",
      }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div
          className="modal-content rounded-4 shadow"
          style={{ backgroundColor: "#1a1a1a", color: "white" }}
        >
          <div className="modal-header p-4 pb-3 border-bottom-0">
            <h2 className="fw-bold mb-0 fs-3">Add Car Info</h2>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={props.close}
              aria-label="Close"
            ></button>
          </div>

          <div className="modal-body p-4 pt-0">
            <form onSubmit={(e) => {
              e.preventDefault();
              const username = localStorage.getItem('username');
              props.handleSubmit({
                "username": username,
                "make": make,
                "model": model,
                "year": parseInt(year),
                "mileage": parseInt(milesDriven),
                "tireAge": parseInt(age),
              })
              
            }}>
              <div className="mb-3">
                <label htmlFor="make" className="form-label" style={{ color: "white" }}>
                  Make
                </label>
                <input
                  type="text"
                  value={make}
                  onChange={handleMakeChange}
                  className="form-control rounded-3"
                  id="make"
                  placeholder="Toyota"
                  style={{ backgroundColor: "#2a2a2a", color: "white", borderColor: "#555" }}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="model" className="form-label" style={{ color: "white" }}>
                  Model
                </label>
                <input
                  type="text"
                  value={model}
                  onChange={handleModelChange}
                  className="form-control rounded-3"
                  id="model"
                  placeholder="Corolla"
                  style={{ backgroundColor: "#2a2a2a", color: "white", borderColor: "#555" }}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="year" className="form-label" style={{ color: "white" }}>
                  Year
                </label>
                <input
                  type="number"
                  value={year}
                  onChange={handleYearChange}
                  className="form-control rounded-3"
                  id="year"
                  placeholder="2022"
                  style={{ backgroundColor: "#2a2a2a", color: "white", borderColor: "#555" }}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="tireAge" className="form-label" style={{ color: "white" }}>
                  Last Replacement
                </label>
                <input
                  type="text"
                  value={age}
                  onChange={handleAgeChange}
                  className="form-control rounded-3"
                  id="tireAge"
                  placeholder="2020"
                  style={{ backgroundColor: "#2a2a2a", color: "white", borderColor: "#555" }}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="tireMiles" className="form-label" style={{ color: "white" }}>
                  Miles Driven (In Miles)
                </label>
                <input
                  type="text"
                  value={milesDriven}
                  onChange={handleMilesChange}
                  className="form-control rounded-3"
                  id="tireMiles"
                  placeholder="400"
                  style={{ backgroundColor: "#2a2a2a", color: "white", borderColor: "#555" }}
                />
              </div>

              <div className="mb-3">
                <label
                  htmlFor="drivingConditions"
                  className="form-label"
                  style={{ color: "white" }}
                >
                  Typical Driving Conditions
                </label>
                <select
                  className="form-select rounded-3"
                  value={drivingConditions}
                  onChange={handleDrivingChange}
                  id="drivingConditions"
                  style={{ backgroundColor: "#2a2a2a", color: "white", borderColor: "#555" }}
                >
                  <option value="">Select...</option>
                  <option value="city">City</option>
                  <option value="highway">Highway</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>

              <button
                type="submit"
                
                className="w-100 btn btn-lg rounded-3 btn-primary"
              >
                Add Car
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
