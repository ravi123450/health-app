import React, { useState } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import "./Ashu.css";

const Ashu = () => {
  const [image, setImage] = useState(null);  // Store the captured image
  const [ingredients, setIngredients] = useState([]);
  const [probabilities, setProbabilities] = useState([]);
  const [mass, setMass] = useState(100);  // Default mass value
  const [nutritionInfo, setNutritionInfo] = useState(null);
  const [mealType, setMealType] = useState('breakfast');  // Default meal type is 'breakfast'
  const [capturing, setCapturing] = useState(false);
  const [isCaptured, setIsCaptured] = useState(false);  // Flag to manage button visibility

  const webcamRef = React.useRef(null);

  // Capture image from the webcam
  const captureImage = () => {
    const imageSrc = webcamRef.current.getScreenshot();  // Get base64 image string
    setImage(imageSrc);  // Store the captured image in the state
    setCapturing(true);  // Set capturing state to true
    setIsCaptured(true); // Set the flag to true after capturing image
  };

  const handleMassChange = (e) => {
    setMass(e.target.value);  // Update the mass value when the user changes it
  };

  const handleMealTypeChange = (e) => {
    setMealType(e.target.value);  // Update the meal type value when the user changes it
  };

  // Handle base64 image to send to backend for prediction
  const predict = async () => {
    if (!image) {
      console.error("No image captured.");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5001/predict', {
      image: image,  // Send the base64 image to the backend
      mass: mass,    // Send the mass value along with the image
      meal_type: mealType, // Send the meal type value
    }, {
     headers: {
    'Authorization': `Bearer ${token}`,  // Add token in the Authorization header
      },
    });


      setIngredients(response.data.ingredients);
      setProbabilities(response.data.probabilities);
      setNutritionInfo(response.data.nutrition);
    } catch (error) {
      console.error("Error in prediction:", error);
    }
  };

  // Reset the state to capture a new image
  const captureNewImage = () => {
    setImage(null);
    setIngredients([]);
    setProbabilities([]);
    setNutritionInfo(null);
    setCapturing(false);
    setIsCaptured(false); // Reset the flag to show the "Capture Image" button again
  };

  return (
    <div className="app-container">
      <h1 className="header">Food Nutrient Prediction</h1>

      {/* Display webcam or captured image */}
      {capturing ? (
        <>
          <div className="image-container">
            <img src={image} alt="Captured" className="captured-image" />
          </div>
          <div className="input-container">
            <label>Mass (grams):</label>
            <input 
              type="number" 
              value={mass} 
              onChange={handleMassChange}  // Handle mass change
              className="input-field"
            />
            <label>Meal Type:</label>
            <select 
              value={mealType} 
              onChange={handleMealTypeChange} 
              className="meal-type-dropdown"
            >
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
            </select>
            <button className="button" onClick={predict}>Predict Nutrition & Ingredients</button>
          </div>
          <div className="nutrition-info">
            {nutritionInfo && (
              <div>
                <h3>Nutrition Info:</h3>
                <p><strong>Protein:</strong> {nutritionInfo.protein}</p>
                <p><strong>Fat:</strong> {nutritionInfo.fat}</p>
                <p><strong>Carbs:</strong> {nutritionInfo.carbs}</p>
                <p><strong>Calories:</strong> {nutritionInfo.calories}</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="webcam-container">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width="100%"
            videoConstraints={{
              facingMode: "environment"
            }}
          />
        </div>
      )}

      {/* Buttons to capture image and predict */}
      {!isCaptured ? (
        <button className="button capture-btn" onClick={captureImage}>Capture Image</button>
      ) : (
        <button className="button capture-btn" onClick={captureNewImage}>Capture New Image</button>
      )}

      {/* Display predicted ingredients */}
      <div className="ingredients-container">
        {ingredients.length > 0 ? (
          <ul className="ingredients-list">
            {ingredients.map((ingredient, index) => (
              <li key={index} className="ingredient-item">
                {ingredient}: {probabilities[index].toFixed(2)}% {/* Display probability as percentage */}
              </li>
            ))}
          </ul>
        ) : (
          <p>No ingredients predicted yet.</p>
        )}
      </div>
    </div>
  );
};

export default Ashu;
