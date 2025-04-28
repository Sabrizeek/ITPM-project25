import React from 'react';
import { Route, Routes } from 'react-router-dom';
import './App.css';
import { ConfigProvider } from 'antd';

import Home from './Components/Home/Home';
import Register from './Components/Register/Register';
import Login from './Components/Login/Login';
import Admin from './Components/Admin/Admin';
import CalendarComponent from './Components/Follow-ups/Calendar';

function App() {
  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#00b96b' } }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/mainhome" element={<Home />} />
          <Route path="/home2" element={<Admin />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/calendar" element={<CalendarComponent />} />
          <Route path="*" element={<div>404: Page Not Found</div>} />
        </Routes>
      </div>
    </ConfigProvider>
  );
}

export default App;