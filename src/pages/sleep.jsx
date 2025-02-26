import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import axios from "axios";
import { Chart as ChartJS, LineElement, CategoryScale, Title, Tooltip, Legend, LinearScale, PointElement } from "chart.js";
import "./sleep.css";

ChartJS.register(LineElement, CategoryScale, Title, Tooltip, Legend, LinearScale, PointElement);

const SleepTracker = () => {
  const [sleepHours, setSleepHours] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [graphData, setGraphData] = useState({
    labels: [],
    datasets: [
      {
        label: "Hours of Sleep",
        data: [],
        fill: true,
        backgroundColor: "rgba(75, 156, 208, 0.2)", // Gradient fill
        borderColor: "#4B9CD3",
        tension: 0.4,
        borderWidth: 3,
      },
    ],
  });

  useEffect(() => {
    // Fetch sleep data for the last 7 days
    const fetchData = async () => {
      const token = localStorage.getItem("token"); // Get the token from local storage or cookies

      if (!token) {
        setError("User is not authenticated.");
        return;
      }

      try {
        const response = await axios.get("http://localhost:5000/api/users/sleep", {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });

        const { sleepHours, last7Days } = response.data;

        // Ensure the most recent data replaces the data for today
        const today = new Date().toLocaleDateString();
        const updatedSleepHours = sleepHours.map((hours, index) => {
          if (last7Days[index] === today && sleepHours[index] !== undefined) {
            return sleepHours[index];
          }
          return hours;
        });

        setGraphData({
          labels: last7Days,
          datasets: [
            {
              label: "Hours of Sleep",
              data: updatedSleepHours,
              fill: true,
              backgroundColor: "rgba(75, 156, 208, 0.2)", // Gradient fill
              borderColor: "#4B9CD3",
              tension: 0.4,
              borderWidth: 3,
            },
          ],
        });
      } catch (err) {
        console.error("Error fetching sleep data", err);
        setError("Error fetching sleep data");
      }
    };

    fetchData();
  }, []);

  const handleSleepChange = (e) => {
    setSleepHours(e.target.value);
  };

  const handleSleepSubmit = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token"); // Get the token from local storage or cookies

    if (!token) {
      setError("User is not authenticated.");
      setLoading(false);
      return;
    }

    try {
      const date = new Date().toLocaleDateString();
      await axios.post(
        "http://localhost:5000/api/users/sleep",
        { date, hours: sleepHours },
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );

      // Update graph with the new sleep data
      setGraphData((prevData) => {
        const today = new Date().toLocaleDateString();
        let newLabels = [...prevData.labels];
        let newData = [...prevData.datasets[0].data];

        // Check if the current date exists, update it or add it if not
        const todayIndex = newLabels.indexOf(today);
        if (todayIndex !== -1) {
          newData[todayIndex] = sleepHours; // Update existing data
        } else {
          newLabels.push(today);
          newData.push(sleepHours); // Add new entry
        }

        return {
          labels: newLabels,
          datasets: [
            {
              ...prevData.datasets[0],
              data: newData,
            },
          ],
        };
      });

      setLoading(false);
    } catch (error) {
      setError("Error saving sleep data.");
      setLoading(false);
    }
  };

  return (
    <div className="sleep-tracker-container">
      <h2 className="title">Sleep Tracker</h2>
      <div className="input-container">
        <input
          type="number"
          value={sleepHours || ""}
          onChange={handleSleepChange}
          min="0"
          max="24"
          className="sleep-input"
        />
        <button onClick={handleSleepSubmit} disabled={loading} className="submit-button">
          {loading ? "Submitting..." : "Add Sleep"}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="chart-container">
        <Line data={graphData} />
      </div>
    </div>
  );
};

export default SleepTracker;
