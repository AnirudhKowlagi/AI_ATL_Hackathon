import React from "react";
import { useNavigate } from "react-router-dom";

export default function DHeader(props){
  const navigateTo = useNavigate();

  function logOff(){
    localStorage.removeItem("username");
    navigateTo("/");
  }

  return (
    <div class="container">
      <div class="d-flex flex-wrap align-items-center justify-content-center justify-content-md-between p-3">
        <a
          href="/"
          class="d-flex align-items-center mb-2 mb-lg-0 link-body-emphasis text-decoration-none"
        >
          <span class="fs-3 text-light">TireTry</span>
        </a>

        {props.context === "Image" && (
            <a onClick={props.onCarClick} className="nav-link link-secondary text-light" style={{"marginRight": "35px"}}>
              My Cars
            </a>
        )}

        <div class="dropdown text-end">
          <a
            href="#"
            class="d-block link-body-emphasis text-decoration-none dropdown-toggle"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <img
              src="Assets/Profile.jpg"
              alt="mdo"
              width="32"
              height="32"
              class="rounded-circle"
            />
          </a>

          <ul class="dropdown-menu text-small">
            <li><a class="dropdown-item">Settings</a></li>
            <li><hr class="dropdown-divider"/></li>
            <li><a class="dropdown-item" onClick={logOff}>Sign out</a></li>
          </ul>
        </div>

      </div>
    </div>

  )
}