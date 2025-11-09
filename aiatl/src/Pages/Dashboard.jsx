import React from "react";
import axios from "axios";
import { useState } from "react";
import { useEffect } from "react";
import DHeader from "../Components/Dashboard/DHeader";
import ImgDashboard from "../Components/Dashboard/ImgDashboard";
import CarList from "../Components/Dashboard/CarList";
import FormModal from "../Components/Dashboard/FormModal";

export default function Dashboard() {
  const [showModal, setShowModal] = useState(false);
  const [context, setContext] = useState("Cars");
  const [cars, setCars] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  const username = localStorage.getItem("username"); 

  const fetchCars = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/getCars?username=${username}`);
      setCars(response.data.cars || []);
    } catch (err) {
      console.error("Error fetching cars:", err);
      setCars([]);
    }
  };

  useEffect(() => {
    fetchCars(); 
  }, []);

  function addButtonClicked(){
    setShowModal(true);
  }

  async function handleSubmitCar(car){
    try {
      const response = await axios.post("http://localhost:3000/addCar", car);

      console.log("Add car response:", response.data);

      setShowModal(false);

      fetchCars()
    } catch (err) {
      console.error("Error adding car:", err);
      alert("Failed to add car. Please try again.");
    }
  }

  function switchContextToImg(car){
    setSelectedCar(car)
    setContext("Image");
  }

  function switchContextToCars(){
    setContext("Cars");
  }

  return (
    <div style={{
      height: "100vh",
      background: "#0a0a0a",
      position: "relative",
      overflowY: "auto"
    }}>
      <div style={{
        position: "absolute",
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
        pointerEvents: "none"
      }} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <DHeader context={context} onCarClick={switchContextToCars}/>
        {context === "Cars" ?
        <>
            <CarList onAddClick={addButtonClicked} cars={cars} onCarClick={switchContextToImg}/>
            <FormModal show={showModal} handleSubmit={handleSubmitCar} close={() => setShowModal(false)} />
        </>
        :
        <ImgDashboard car={selectedCar} latitude={latitude} longitude={longitude}/>
        }
        
      </div>
    </div>
  )
}