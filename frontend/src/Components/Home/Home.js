import React from 'react';
import NavHome from '../Nav/NavHome'; // Your existing Nav
import './Home.css'; // Make sure you create Home.css

function Home() {
  return (
    <div>
      <NavHome />
      
      <div className="home-container">
        <header className="hero-section">
          <h1>Welcome to ConnectVault</h1>
          <p>Your intelligent digital contact manager with emotional touch</p>
          <button className="get-started-btn" onClick={() => window.location.href = '/login'}>
            Get Started
          </button>
        </header>

        <section className="about-section">
          <h2>What is ConnectVault?</h2>
          <p>
            ConnectVault is a modern, web-based contact management system designed
            to make organizing contacts, scheduling follow-ups, and chatting easier and smarter.
            It brings emotion-driven interaction to boost productivity and engagement.
          </p>
        </section>

        <section className="features-section">
          <h2>Key Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>📇 Contact Management</h3>
              <p>Store, categorize, and organize contacts efficiently with search and filter options.</p>
            </div>
            <div className="feature-card">
              <h3>⏰ Follow-Up Scheduling</h3>
              <p>Use the calendar view to schedule reminders and stay ahead of your tasks.</p>
            </div>
            <div className="feature-card">
              <h3>💬 Emotion-Driven Chat</h3>
              <p>Live chat that adapts to your emotions and provides smart feedback based on your mood.</p>
            </div>
            <div className="feature-card">
              <h3>📄 Export Data</h3>
              <p>Export your contacts and follow-ups easily in PDF/CSV formats for backup or reporting.</p>
            </div>
          </div>
        </section>

        <section className="about-us-section">
          <h2>About Us</h2>
          <p>
            We are a passionate group of IT students from SLIIT, aiming to bridge the gap
            between technology and emotional intelligence. ConnectVault is our step toward
            building smarter and more human-centric digital tools.
          </p>
        </section>

        <footer className="footer">
          © 2024 ConnectVault. All rights reserved.
        </footer>
      </div>
    </div>
  );
}

export default Home;
