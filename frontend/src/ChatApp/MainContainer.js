import React, { createContext, useState, useEffect } from "react";
import "./myStyles.css";
import Sidebar from "./Sidebar";
import { Outlet, useNavigate } from "react-router-dom";

export const myContext = createContext();

const emotionBackgrounds = {
  Happy: "#fffacd",
  Sad: "#87ceeb",
  Angry: "#ff6347",
  Love: "#ffb6c1",
  Neutral: "#f0f2f5",
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
      }}
    >
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