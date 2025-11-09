import React from "react";
import { useState } from "react";
import Header from "../Components/LandingPage/Header";
import Hero from "../Components/LandingPage/Hero";
import LoginModal from "../Components/LoginModals/LoginModal";

export default function LandingPage(){
  const [showLogin, setShowLogin] = useState(false);
  const [type, setType] = useState("Login");

  function setLogin(modalType){
    setType(modalType)
    setShowLogin(true);
  }

  function closeLogin(){
    setShowLogin(false);
  }

  return (
    <>
      <Header />
      <Hero loginClick={setLogin}/>
      <LoginModal show={showLogin} close={closeLogin} type={type}/>
    </>
  )
}