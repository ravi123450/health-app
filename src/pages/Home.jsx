import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import { FaPlus, FaMinus, FaGlassWhiskey } from "react-icons/fa";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const Home = () => {
  const [userData, setUserData] = useState(null);
  const [waterIntake, setWaterIntake] = useState(0);
  const [temperature, setTemperature] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.log("User not logged in. Redirecting...");
      navigate("/login"); // Redirect to login if no token
      return;
    }

    fetchUserData(token);
    fetchWeatherData();
  }, [navigate]);

  // ✅ Fetch user data after login
  const fetchUserData = async (token) => {
    try {
      const response = await fetch("http://localhost:5000/api/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (response.ok) {
        setUserData(data);
        console.log("User data loaded:", data);
      } else {
        console.error("User data fetch failed:", data);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  // ✅ Fetch weather data (temperature)
  const fetchWeatherData = async () => {
    try {
      const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=YOUR_API_KEY&q=auto:ip`
      );
      const data = await response.json();
      if (response.ok) {
        setTemperature(data.current.temp_c);
        console.log("Weather data loaded:", data);
      }
    } catch (error) {
      console.error("Error fetching weather data:", error);
    }
  };

  // ✅ Handle Water Intake (Max: 7 Glasses)
  const handleWaterChange = (change) => {
    setWaterIntake((prev) => Math.max(0, Math.min(7, prev + change)));
  };

  // ✅ Navigate to the correct logging page and send the mealType as part of the state
  const handleLogMeal = (mealType) => {
    navigate("/log-food", { state: { mealType } });
  };

  return (
    <div className="home-container">
      {/* ✅ Header */}
      <header className="header">
        <h1>Nuvola</h1>
        <nav>
          <ul>
            <li onClick={() => navigate("/goals")}>goals</li>
            <li onClick={() => navigate("/progress")}>Progress</li>
            <li onClick={() => navigate("/dietplan")}>Diet Plan</li>
            <li onClick={() => window.location.href = "https://nuv0la.online"}>Food Store</li>
          </ul>
        </nav>
        <button className="profile-btn" onClick={() => navigate("/profile")}>
          P
        </button>
      </header>

      {/* ✅ Main Dashboard */}
      <div className="dashboard">
        {/* ✅ Water Intake Section */}
        <div className="water-intake">
          <h2>Water Intake</h2>
          <p className="climate">{temperature ? `${temperature}°C` : "Loading..."}</p>

          {/* Water Circle */}
          <div className="water-circle">
            <div className="water-fill" style={{ height: `${(waterIntake / 7) * 100}%` }}></div>
            <FaGlassWhiskey className="glass-icon" />
          </div>

          {/* Water Controls */}
          <div className="water-tracker">
            <button onClick={() => handleWaterChange(-1)}>
              <FaMinus />
            </button>
            <p>{waterIntake}/7 Glasses</p>
            <button onClick={() => handleWaterChange(1)}>
              <FaPlus />
            </button>
          </div>
        </div>

        {/* ✅ Track Food Section */}
        <div className="track-food">
          <h2>Track Food</h2>
          <div className="calorie-circle">
            <CircularProgressbar
              value={userData?.calories || 0}
              maxValue={userData?.calorieIntake || 2000}
              text={`${userData?.calories || 0} / ${userData?.calorieIntake || "N/A"} kcal`}
              styles={buildStyles({
                textColor: "#333",
                pathColor: "#ff5733",
                trailColor: "#ddd",
              })}
            />
          </div>

          {/* ✅ Macros with Progress Bars */}
          <div className="macros">
            {[
              { name: "Protein", className: "progress-protein" },
              { name: "Carbs", className: "progress-carbs" },
              { name: "Fats", className: "progress-fats" },
              { name: "Magnesium", className: "progress-magnesium" },
              { name: "Sodium", className: "progress-sodium" },
            ].map((macro, index) => {
              const macroValue = userData?.macros?.[macro.name.toLowerCase()] || 0;
              const macroPercentage = Math.min((macroValue / 500) * 100, 100); // Scale to 100%

              return (
                <div className="macro-bar" key={index}>
                  <span>{macro.name}</span>
                  <div className="progress-container">
                    <div
                      className={`progress-bar ${macro.className}`}
                      style={{ width: `${macroPercentage}%` }}
                    ></div>
                  </div>
                  <span className="macro-value">{macroValue}g</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ✅ Food Logging Section */}
      <div className="food-logging">
        {["breakfast", "lunch", "dinner", "snack"].map((meal) => (
          <div key={meal} className="meal-log">
            <p>Recommended: 300-500 cal</p>
            <button onClick={() => handleLogMeal(meal)}>{`Log ${meal}`}</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
