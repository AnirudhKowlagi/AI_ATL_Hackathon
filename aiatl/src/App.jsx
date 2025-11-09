import React from "react"
import { Route, Routes } from "react-router-dom"
import LandingPage from "./Pages/LandingPage"
import Dashboard from "./Pages/Dashboard"
import Result from "./Pages/Result"

export default function App() {
  return (
    <>
      <Routes>
        <Route index element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/result" element={<Result />} />
      </Routes>
      
    </>
  )
}
