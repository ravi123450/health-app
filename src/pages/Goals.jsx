import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Line } from "react-chartjs-2";
import { useInView } from "react-intersection-observer";
import "./Goals.css";

const Goals = () => {
  const [userData, setUserData] = useState(null);
  const [sleepData, setSleepData] = useState({ labels: [], data: [] });
  const navigate = useNavigate();
  const { ref: calorieRef, inView: calorieInView } = useInView({ triggerOnce: true });
  const { ref: waterRef, inView: waterInView } = useInView({ triggerOnce: true });
  const { ref: sleepRef, inView: sleepInView } = useInView({ triggerOnce: true });
  const { ref: exerciseRef, inView: exerciseInView } = useInView({ triggerOnce: true });

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    fetchUserData(token);
  }, [navigate]);

  const fetchUserData = async (token) => {
    try {
      const response = await axios.get("http://localhost:5000/api/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        setUserData(response.data);
        fetchSleepData(response.data.sleepData);  // Fetch sleep data once user data is loaded
      } else {
        console.error("User data fetch failed");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchSleepData = (sleepData) => {
    const last7Days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      last7Days.push(date.toLocaleDateString());
    }

    // Create a map for sleep data using the date as a key
    const sleepDataMap = sleepData.reduce((acc, curr) => {
      acc[curr.date] = curr.hours;
      return acc;
    }, {});

    const sleepHours = last7Days.map((day) => sleepDataMap[day] || 6); // Default to 6 hours if no data

    setSleepData({ labels: last7Days, data: sleepHours });
  };

  // ✅ Pie Chart for Calorie Intake
  const calorieData = {
    labels: ["Carbs", "Proteins", "Fats", "Magnesium", "Sodium"],
    datasets: [
      {
        data: userData
          ? [
              userData.macros.carbs,
              userData.macros.protein,
              userData.macros.fats,
              userData.macros.magnesium,
              userData.macros.sodium,
            ]
          : [0, 0, 0, 0, 0],
        backgroundColor: ["#FF6B6B", "#4ECDC4", "#FFD166", "#1E90FF", "#6A0572"],
      },
    ],
  };

  // ✅ Sleep Tracking Data (Line Chart)
  const sleepChartData = {
    labels: sleepData.labels,
    datasets: [
      {
        label: "Sleep Hours",
        data: sleepData.data,
        fill: true,
        backgroundColor: "rgba(75, 156, 208, 0.2)", // Gradient fill
        borderColor: "#4B9CD3",
        tension: 0.4,
        borderWidth: 3,
      },
    ],
  };

  return (
    <div className="goals-container">
      <h1 className="title">Your Goals & Progress</h1>

      {/* ✅ Calorie Intake */}
      <div className={`goal-box ${calorieInView ? "fade-in" : ""}`} ref={calorieRef}>
        <h2>Calorie Intake: {userData?.calorieIntake || 0} cal</h2>
        <Line data={calorieData} />
        <div className="macros-container">
          {["Protein", "Carbs", "Fats", "Magnesium", "Sodium"].map((macro, index) => {
            const macroValue = userData?.macros?.[macro.toLowerCase()] || 0;
            return (
              <div className="macro-item" key={index}>
                <span>{macro}: </span>
                <span className="macro-value">{macroValue}g</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ✅ Water Intake */}
      <div className={`goal-box ${waterInView ? "fade-in" : ""}`} ref={waterRef}>
        <h2>Water Intake: {userData?.waterIntake || 7} Glasses</h2>

        {/* ✅ Water Glass with Wave Effect */}
        <div className="water-glass">
          <div className="water-fil">
            <div className="wave"></div>
          </div>
        </div>

        <p className="water-intake-text">{userData?.waterIntake || 7} Glasses</p>
      </div>

      {/* ✅ Sleep Tracking */}
      <div className={`goal-box ${sleepInView ? "fade-in" : ""}`} ref={sleepRef}>
        <h2>Daily Sleep (Goal: 8 hrs/day)</h2>
        <div className="sleep-chart">
          <Line data={sleepChartData} options={{ maintainAspectRatio: false, responsive: true }} />
        </div>
        <button className="track-btn" onClick={() => navigate("/sleep")}>
          Track Sleep
        </button>
      </div>

      {/* ✅ Exercise Tracking */}
      <div className={`goal-box ${exerciseInView ? "fade-in" : ""}`} ref={exerciseRef}>
        <h2>Exercise: 2 Hours Daily</h2>
        <p>"The only bad workout is the one that didn’t happen." 💪</p>
        <button className="track-btn">Start Exercise</button>
      </div>
    </div>
  );
};

export default Goals;
