import React, { createContext, useState, useEffect } from "react";
import "./myStyles.css";
import Sidebar from "./Sidebar";
import { Outlet, useNavigate } from "react-router-dom";

export const myContext = createContext();

function MainContainer() {
  const [refresh, setRefresh] = useState(true);
  const [dominantEmotion, setDominantEmotion] = useState("Neutral");
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem("userData"));

  useEffect(() => {
    if (!userData) {
      navigate("/login");
    }
  }, [userData, navigate]);

  return (
    <div className="main-container">
      <myContext.Provider
        value={{
          refresh,
          setRefresh,
          dominantEmotion,
          setDominantEmotion,
        }}
      >
        <Sidebar />
        <Outlet />
      </myContext.Provider>
    </div>
  );
}

export default MainContainer;