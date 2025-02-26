import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bar, Doughnut } from "react-chartjs-2";
import "chart.js/auto";
import "./Registration.css";

const steps = [
  { id: 1, question: "Your Name", field: "name", type: "text", placeholder: "Enter your name" },
  { id: 2, question: "Your Gender", field: "gender", type: "radio", options: ["Male", "Female"] },
  { id: 3, question: "Your Age", field: "age", type: "number", placeholder: "Enter your age" },
  { id: 4, question: "Activity Level", field: "activity", type: "radio", options: ["Sedentary", "Moderate", "Active"] },
  { id: 5, question: "Height (cm)", field: "height", type: "number", placeholder: "Enter height in cm" },
  { id: 6, question: "Current Weight (kg)", field: "weight", type: "number", placeholder: "Enter weight in kg" },
  { id: 7, question: "Target Weight (kg)", field: "targetWeight", type: "number", placeholder: "Enter target weight in kg" },
  { id: 8, question: "Medical Conditions", field: "medicalCondition", type: "checkbox", options: ["Diabetes", "Obesity", "Injury", "Other"] },
  { id: 9, question: "Your Nutrition & BMI", field: "bmi", type: "bmi" }
];

const Registration = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    age: "",
    activity: "",
    height: "",
    weight: "",
    targetWeight: "",
    medicalCondition: [],
  });

  const totalSteps = steps.length;
  const navigate = useNavigate();

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox"
        ? checked
          ? [...(prev[name] || []), value]
          : prev[name]?.filter((item) => item !== value)
        : value
    }));
  };

  const validateCurrentStep = () => {
    const step = steps[currentStep];
    if (step.type === "radio" || step.type === "text" || step.type === "number") {
      return formData[step.field] && formData[step.field] !== "";
    }
    if (step.type === "checkbox") {
      return formData[step.field] && formData[step.field].length > 0;
    }
    return true;
  };

  const calculateBMI = () => {
    const height = parseFloat(formData.height) || 1;
    const weight = parseFloat(formData.weight) || 1;
    return (weight / ((height / 100) ** 2)).toFixed(1);
  };

  const calculateCalories = () => {
    const weight = parseFloat(formData.weight) || 1;
    const activityMultiplier = formData.activity === "Sedentary" ? 24 : formData.activity === "Moderate" ? 30 : 35;
    return (weight * activityMultiplier).toFixed(0);
  };

  const calculateMacros = () => {
    const calories = calculateCalories();
    return {
      protein: ((calories * 0.3) / 4).toFixed(1),
      carbs: ((calories * 0.4) / 4).toFixed(1),
      fats: ((calories * 0.3) / 9).toFixed(1),
      magnesium: 400,
      sodium: 2300,
    };
  };

  const calculateTimeToTargetWeight = () => {
    const currentWeight = parseFloat(formData.weight) || 1;
    const targetWeight = parseFloat(formData.targetWeight) || 1;
    const weightToLose = Math.abs(currentWeight - targetWeight);
    const weeks = (weightToLose / 0.45).toFixed(1);
    return `${weeks} weeks (~${(weeks / 4).toFixed(1)} months)`;
  };

  const handleSignIn = () => {
    const registrationData = {
      ...formData,
      bmi: calculateBMI(),
      caloriesIntake: 0,
      calorieIntake: calculateCalories(),
      macros: calculateMacros(),
      estimatedTimeToTargetWeight: calculateTimeToTargetWeight(),
    };

    console.log("🔍 Passing Registration Data to SignUp:", registrationData);
    navigate("/signin", { state: { formData: registrationData } });
  };

  const macros = calculateMacros();

  return (
    <div className="registration-container">
      <div className="progress-bar">
        <div style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }} className="progress"></div>
      </div>

      <div className="registration-box">
        <h2>{steps[currentStep].question}</h2>

        {steps[currentStep].type === "bmi" ? (
          <div className="bmi-box">
            <h3>Your BMI: {calculateBMI()}</h3>
            <p>{calculateBMI() < 18.5 ? "Underweight" : calculateBMI() < 25 ? "Normal" : "Overweight"}</p>
            <h4>Daily Caloric Intake: {calculateCalories()} kcal</h4>
            <h4>Time to Target Weight: {calculateTimeToTargetWeight()}</h4>
            <div className="graph-container">
              <Bar
                data={{
                  labels: ["Protein (g)", "Carbs (g)", "Fats (g)", "Magnesium (mg)", "Sodium (mg)"],
                  datasets: [{ label: "Daily Intake", data: [macros.protein, macros.carbs, macros.fats, macros.magnesium, macros.sodium], backgroundColor: ["#4CAF50", "#2196F3", "#FFC107", "#9C27B0", "#FF5722"] }]
                }}
              />
              <Doughnut
                data={{
                  labels: ["Weeks to Target", "Remaining Weeks"],
                  datasets: [{ data: [parseFloat(calculateTimeToTargetWeight().split(" ")[0]), 12 - parseFloat(calculateTimeToTargetWeight().split(" ")[0])], backgroundColor: ["#FF9800", "#E0E0E0"] }]
                }}
              />
            </div>
          </div>
        ) : steps[currentStep].type === "radio" ? (
          steps[currentStep].options.map((option) => (
            <label key={option}>
              <input type="radio" name={steps[currentStep].field} value={option} checked={formData[steps[currentStep].field] === option} onChange={handleChange} required />
              {option}
            </label>
          ))
        ) : steps[currentStep].type === "checkbox" ? (
          steps[currentStep].options.map((option) => (
            <label key={option}>
              <input type="checkbox" name={steps[currentStep].field} value={option} checked={formData[steps[currentStep].field]?.includes(option)} onChange={handleChange} required />
              {option}
            </label>
          ))
        ) : (
          <input type={steps[currentStep].type} name={steps[currentStep].field} value={formData[steps[currentStep].field] || ""} onChange={handleChange} placeholder={steps[currentStep].placeholder} required />
        )}

        {currentStep < totalSteps - 1 ? (
          <button onClick={handleNext} disabled={!validateCurrentStep()}>Next</button>
        ) : (
          <button className="sign-in-btn" onClick={handleSignIn}>Sign Up to Save Data</button>
        )}
      </div>
    </div>
  );
};

export default Registration;
