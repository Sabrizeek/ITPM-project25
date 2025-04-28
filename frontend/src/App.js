import React from "react";
import "./App.css";
import { Route, Routes } from "react-router-dom";
import { ConfigProvider } from 'antd';

import Home from './Components/Home/Home';
import Register from './Components/Register/Register';
import Login from './Components/Login/Login';
import Admin from './Components/Admin/Admin';
import CalendarComponent from './Components/Follow-ups/Calendar';
import MainContainer from "./ChatApp/MainContainer";
import ChatArea from "./ChatApp/ChatArea";
import Users from "./ChatApp/Users";
import { useDispatch, useSelector } from "react-redux";

function App() {
  const dispatch = useDispatch();
  const lightTheme = useSelector((state) => state.themeKey);

  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#00b96b' } }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }} className={"App" + (lightTheme ? "" : "-dark")}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/mainhome" element={<Home />} />
          <Route path="/home2" element={<Admin />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/calendar" element={<CalendarComponent />} />
          
          {/* Chat routes */}
          <Route path="app" element={<MainContainer />}>
            <Route path="welcome" element={<Users />} />
            <Route path="chat/:_id" element={<ChatArea />} />
          </Route>
          
          <Route path="*" element={<div>404: Page Not Found</div>} />
        </Routes>
      </div>
    </ConfigProvider>
  );
}

export default App;
