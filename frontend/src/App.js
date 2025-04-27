import React from "react";
import "./App.css";
import MainContainer from "./ChatApp/MainContainer";
import Login from "./ChatApp/Login";
import { Route, Routes } from "react-router-dom";
import ChatArea from "./ChatApp/ChatArea";
import Users from "./ChatApp/Users";
import { useDispatch, useSelector } from "react-redux";


function App() {
  const dispatch = useDispatch();
  const lightTheme = useSelector((state) => state.themeKey);

  return (
    <div className={"App" + (lightTheme ? "" : "-dark")}>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="app" element={<MainContainer />}>
          <Route path="welcome" element={<Users />} />
          <Route path="chat/:_id" element={<ChatArea />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;