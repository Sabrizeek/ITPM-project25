import React, { createContext, useState, useEffect } from "react";
import "./myStyles.css";
// import "./nav.css";
import Sidebar from "./Sidebar";
import NavHome from "../Components/Nav/NavHome";
import { Outlet, useNavigate } from "react-router-dom";

export const myContext = createContext();

const emotionBackgrounds = {
  Happy: "#fffacd",
  Sad: "#87ceeb",
  Angry: "#ff6347",
  Love: "#ffb6c1",
  Neutral: "#f4f2f5",
};

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
    <div
      className="main-container"
      style={{
        backgroundColor: emotionBackgrounds[dominantEmotion],
        transition: "background-color 0.5s ease",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
      }}
    >
      <NavHome />
      <br/> <br/> <br/> <br/>
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <myContext.Provider
          value={{
            refresh,
            setRefresh,
            dominantEmotion,
            setDominantEmotion,
          }}
        >
          <Sidebar />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <Outlet />
          </div>
        </myContext.Provider>
      </div>
    </div>
  );
}

export default MainContainer;