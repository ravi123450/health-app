import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import "./Progress.css";

const Progress = () => {
  const [userData, setUserData] = useState(null);
  const [bmiCategory, setBmiCategory] = useState("");
  const [bmiColor, setBmiColor] = useState("#fff");
  const [bodyMeasurements, setBodyMeasurements] = useState({
    chest: "--",
    waist: "--",
    hips: "--",
  });
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);
  const navigate = useNavigate();

  // ✅ Fetch user data from API or localStorage on page load
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    // ✅ Try loading measurements from localStorage first
    const storedMeasurements = localStorage.getItem("measurements");
    if (storedMeasurements) {
      setBodyMeasurements(JSON.parse(storedMeasurements));
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

        // ✅ Set the latest measurements from the backend
        if (response.data.measurements) {
          const newMeasurements = {
            chest: response.data.measurements.chest || "--",
            waist: response.data.measurements.waist || "--",
            hips: response.data.measurements.hips || "--",
          };
          setBodyMeasurements(newMeasurements);
          localStorage.setItem("measurements", JSON.stringify(newMeasurements)); // ✅ Store in localStorage
        }

        calculateBMI(response.data);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const calculateBMI = (data) => {
    if (data?.weight && data?.height) {
      let heightInMeters = data.height / 100;
      let bmi = (data.weight / (heightInMeters * heightInMeters)).toFixed(1);
      let category = "";
      let color = "";

      if (bmi < 18.5) {
        category = "Underweight";
        color = "#3498db"; // Blue
      } else if (bmi >= 18.5 && bmi < 24.9) {
        category = "Healthy Weight";
        color = "#2ecc71"; // Green
      } else if (bmi >= 25 && bmi < 29.9) {
        category = "Overweight";
        color = "#f39c12"; // Orange
      } else {
        category = "Obese";
        color = "#e74c3c"; // Red
      }

      setBmiCategory(category);
      setBmiColor(color);
    }
  };

  const handleUpdateMeasurements = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Unauthorized: No token found");
        return;
      }

      const updatedMeasurements = {
        chest: bodyMeasurements.chest,
        waist: bodyMeasurements.waist,
        hips: bodyMeasurements.hips,
      };

      console.log("📩 Sending Measurements Data:", updatedMeasurements);

      const response = await axios.post(
        "http://localhost:5000/api/users/update-measurements",
        updatedMeasurements,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        alert("✅ Measurements updated successfully!");

        // ✅ Save to localStorage to persist after refresh
        localStorage.setItem("measurements", JSON.stringify(updatedMeasurements));

        // ✅ Fetch updated data from the server
        fetchUserData(token);
        setShowUpdatePopup(false);
      }
    } catch (error) {
      console.error("🚨 Error updating measurements:", error);
      alert("Error updating measurements. Please try again.");
    }
  };

  const weightProgressData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "Weight Progress",
        data: [userData?.weight || 70, 69, 68, 67],
        backgroundColor: "#1E90FF",
      },
    ],
  };

  return (
    <div className="progres-container">
      <h1 className="title">Your Progress</h1>

      {/* ✅ BMI Section */}
      <div className="progress-box">
        <h2>BMI & Body Category</h2>
        <div className="bmi-wrapper">
          <div className="bmi-circle" style={{ backgroundColor: bmiColor }}>
            <span>{bmiCategory}</span>
          </div>
          <div className="bmi-ranges">
            <p><span style={{ color: "#3498db" }}>Underweight:</span> BMI {"<"} 18.5</p>
            <p><span style={{ color: "#2ecc71" }}>Healthy Weight:</span> 18.5 - 24.9</p>
            <p><span style={{ color: "#f39c12" }}>Overweight:</span> 25 - 29.9</p>
            <p><span style={{ color: "#e74c3c" }}>Obese:</span> BMI {">="} 30</p>
          </div>
        </div>
      </div>

      {/* ✅ Body Measurements Section */}
      <div className="progress-box">
        <h2>Body Measurements</h2>
        <p>Height: {userData?.height} cm</p>
        <p>Weight: {userData?.weight} kg</p>
        <p>Chest: {bodyMeasurements.chest} cm</p>
        <p>Waist: {bodyMeasurements.waist} cm</p>
        <p>Hips: {bodyMeasurements.hips} cm</p>
        <button className="update-btn" onClick={() => setShowUpdatePopup(true)}>Update Details</button>
      </div>

      {/* ✅ Goal Weight Visualization */}
      <div className="progress-box">
        <h2>Goal Weight: {userData?.targetWeight} kg</h2>
        <div className="goal-visual">
          <p>{userData?.estimatedTimeToTargetWeight} to achieve goal</p>
        </div>
      </div>

      {/* ✅ Weight Progress Graph */}
      <div className="progress-box">
        <h2>Weight Progress</h2>
        <Bar data={weightProgressData} />
      </div>

      {/* ✅ Update Popup */}
      {showUpdatePopup && (
        <div className="popup">
          <div className="popup-content">
            <h3>Update Measurements</h3>
            <label>Chest (cm): <input type="number" value={bodyMeasurements.chest} onChange={(e) => setBodyMeasurements({ ...bodyMeasurements, chest: e.target.value })} /></label>
            <label>Waist (cm): <input type="number" value={bodyMeasurements.waist} onChange={(e) => setBodyMeasurements({ ...bodyMeasurements, waist: e.target.value })} /></label>
            <label>Hips (cm): <input type="number" value={bodyMeasurements.hips} onChange={(e) => setBodyMeasurements({ ...bodyMeasurements, hips: e.target.value })} /></label>
            <button onClick={handleUpdateMeasurements}>Save</button>
            <button onClick={() => setShowUpdatePopup(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Progress;
