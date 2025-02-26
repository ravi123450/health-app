import React, { useState, useEffect } from 'react';
import './log.css'; // Ensure your CSS is in the log.css file
import { Pie } from 'react-chartjs-2';  // Importing Pie chart from react-chartjs-2
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';  // Chart.js setup
import { Bar } from 'react-chartjs-2';
import { FaCamera } from 'react-icons/fa'; // Importing the camera icon for image capture
import { useNavigate ,useLocation} from 'react-router-dom'; // for navigation

// Registering the chart components
ChartJS.register(ArcElement, Tooltip, Legend);

const LogFoodPage = () => {
    const [foodInput, setFoodInput] = useState('');
    const [quantity, setQuantity] = useState(100);
    const [unit, setUnit] = useState(1); // Meal type is always breakfast
    const [suggestions, setSuggestions] = useState([]);
    const [foodData, setFoodData] = useState({});
    const [popupVisible, setPopupVisible] = useState(false);
    const [totalCalories, setTotalCalories] = useState(0);
    const [recommendedCalories, setRecommendedCalories] = useState(360); // Recommended calories for breakfast (fixed)
    const [loggedCalories, setLoggedCalories] = useState(0); // Logged calories for breakfast on selected date
    const [macroNutrients, setMacroNutrients] = useState({ carbs: 0, proteins: 0, fats: 0, magnesium: 0, sodium: 0 });
    const [breakfastmacroNutrients, setBreakfastmacroNutrients] = useState({ carbs: 0, proteins: 0, fats: 0 });
    const [selectedDate, setSelectedDate] = useState(''); // Store selected date
    const [recommendedtotalCalories, setRecommendedtotalCalories] = useState(0);

    const location = useLocation(); 
    const mealType = location.state?.mealType || "breakfast";

    const navigate = useNavigate(); // Initialize navigate function

    // Fetch total calorie intake and user profile data on page load
    useEffect(() => {
        fetchTotalCalories();
        fetchMacroNutrients();
        fetchRecommendedtotalCalories();
        fetchbreakfastmacroNutrients(); // Fetch logged breakfast data for the selected date
    },  [mealType]); // Fetch data whenever the meal type or date changes

    // Fetch total calories for the user
    const fetchTotalCalories = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5001/user-calories', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await response.json();
            setTotalCalories(data.totalCalories);
        } catch (error) {
            console.error("Error fetching total calories:", error);
        }
    };

    const fetchRecommendedtotalCalories = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/users/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await response.json();
            const mealRecommendedtotalCalories = data.calorieIntake; // Fetch calorie intake for the selected meal type
            setRecommendedtotalCalories(mealRecommendedtotalCalories);
        } catch (error) {
            console.error("Error fetching recommended calories:", error);
        }
    };

    // Fetch macro nutrients from the user profile
    const fetchMacroNutrients = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/users/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await response.json();
            setMacroNutrients({
                carbs: data.macros.carbs || 0,
                proteins: data.macros.protein || 0,
                fats: data.macros.fats || 0,
                magnesium: data.macros.magnesium || 0,
                sodium: data.macros.sodium || 0,
            });
        } catch (error) {
            console.error("Error fetching macro nutrients:", error);
        }
    };

    // Fetch logged calories and macro nutrients for breakfast on the selected date
    const fetchbreakfastmacroNutrients = async () => {
        const token = localStorage.getItem('token');
        
        if (!token) {
            console.error("No token found, user is not logged in");
            return;
        }

        const selectedDate = new Date().toISOString().split('T')[0]; // Automatically detects today's date

        try {
            const response = await fetch(`http://localhost:5001/total-breakfast-calories?mealType=${mealType}`, {
                headers: {
                    'Authorization': `Bearer ${token}`, // Sending token in the Authorization header
                },
            });

            const data = await response.json();
            
            if (data && data.totalBreakfastCalories !== undefined) {
                console.log(data)
                setLoggedCalories(data.totalBreakfastCalories);
                setBreakfastmacroNutrients({
                    carbs: data.totalCarbs,
                    proteins: data.totalProteins,
                    fats: data.totalFats,
                });
            }
        } catch (error) {
            console.error("Error fetching logged breakfast data:", error);
        }
    };
    
    // Handle search input change and fetch suggestions
    const handleSearchChange = async (e) => {
        const searchTerm = e.target.value.trim();
        setFoodInput(searchTerm);

        if (searchTerm === "") {
            setSuggestions([]);
            return;
        }

        try {
            const response = await fetch(`http://localhost:5001/search?query=${searchTerm}`);
            const data = await response.json();
            setSuggestions(data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    // Fetch product details and show in popup
    const getProduct = async (code) => {
        const response = await fetch(`http://localhost:5001/product/${code}`);
        const data = await response.json();

        const adjustedQuantity = quantity || 100;

        setFoodData({
            ...data,
            calories: (data.calories * adjustedQuantity) / 100,
            carbs: (data.carbs * adjustedQuantity) / 100,
            proteins: (data.proteins * adjustedQuantity) / 100,
            fats: (data.fats * adjustedQuantity) / 100,
        });

        setSuggestions([]);
        setPopupVisible(true);
    };

    // Close popup
    const closePopup = () => {
        setPopupVisible(false);
        setFoodInput('');
    };

    // Save food data to the database with meal type (breakfast, lunch, dinner)
    const saveData = async () => {
        const token = localStorage.getItem('token');

        const data = {
            code: foodData.code,
            name: foodData.name,
            calories: foodData.calories,
            carbs: foodData.carbs,
            proteins: foodData.proteins,
            fats: foodData.fats,
            mealType: mealType, // Include meal type in the data
        };

        const response = await fetch('http://localhost:5001/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            alert('Food saved successfully');
            fetchTotalCalories();
            setSuggestions([]);
            closePopup();
        }
    };

    // Pie Chart Data for Macro Nutrients{total calorie intake}
    const calorieData = {
        labels: ["Carbs", "Proteins", "Fats", "Magnesium", "Sodium"],
        datasets: [
            {
                data: [
                    macroNutrients.carbs,
                    macroNutrients.proteins,
                    macroNutrients.fats,
                    macroNutrients.magnesium,
                    macroNutrients.sodium
                ],
                backgroundColor: ["#FF6B6B", "#4ECDC4", "#FFD166", "#1E90FF", "#6A0572"],
                borderColor: ["#FF3B3B", "#4AACC4", "#FFAA33", "#1871C9", "#690D62"],
                borderWidth: 1,
            },
        ],
    };

    const BreakfastData = {
        labels: ["Carbs", "Proteins", "Fats", ],
        datasets: [
            {
                data: [
                    breakfastmacroNutrients.carbs,
                    breakfastmacroNutrients.proteins,
                    breakfastmacroNutrients.fats,
                ],
                backgroundColor: ["#FF6B6B", "#4ECDC4", "#FFD166"],
                borderColor: ["#FF3B3B", "#4AACC4", "#FFAA33"],
                borderWidth: 1,
            },
        ],
    };

    const breakfastBarChartData = {
        labels: ["Carbs", "Proteins", "Fats"],
        datasets: [
            {
                label: 'Macro nutrients data',
                data: [
                    breakfastmacroNutrients.carbs,
                    breakfastmacroNutrients.proteins,
                    breakfastmacroNutrients.fats,
                ],
                backgroundColor: ["#FF6B6B", "#4ECDC4", "#FFD166"],
                borderColor: ["#FF3B3B", "#4AACC4", "#FFAA33"],
                borderWidth: 1,
            },
        ],
    };

    return (
        <div className="log-food-page">
            <h1>Search for a Food Product</h1>
            <p>Total Calories: {totalCalories}</p>

            <div className="search-container">
                <input
                    type="text"
                    value={foodInput}
                    onChange={handleSearchChange}
                    placeholder="Enter food name"
                />
                <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    placeholder="100"
                />
                <select onChange={(e) => setUnit(Number(e.target.value))} value={unit}>
                    <option value={1}>gm</option>
                    <option value={0.001}>mg</option>
                    <option value={1000}>kg</option>
                </select>
            </div>

            <div id="suggestions" className="suggestions">
                {suggestions.length > 0 ? (
                    suggestions.map((product) => (
                        <div key={product.code} onClick={() => getProduct(product.code)}>
                            <strong>{product.name}</strong>
                        </div>
                    ))
                ) : (
                    <p>No suggestions available</p>
                )}
            </div>

            {/* Camera Icon - Navigate to /image-cap when clicked */}
            <div className="camera-icon" onClick={() => navigate("/image-cap")}>
                <FaCamera size={40} color="white" />
            </div>

            {/* Total Calorie Intake Box */}
            <div className="box total-calorie-intake">
                <h2>Total Calorie Intake </h2>
                <div className="circle-progress">
                    <div className="circle" style={{
                        width: `${(totalCalories / recommendedtotalCalories) * 100}%`,
                        height: `${(totalCalories / recommendedtotalCalories) * 100}%`
                    }}></div>
                </div>
                <div className="logged-text">Logged: {totalCalories} / {recommendedtotalCalories} kcal</div>
                <div className="macro-nutrients-pie-chart">
                    <Pie data={calorieData} />
                </div>
            </div>

            {/* Breakfast Nutrition Section */}
            <div className="box breakfast-nutrition">
                <h2>{mealType} Nutrition  {selectedDate}</h2>
                <div className="circle-progress">
                    <div className="circle" style={{
                        width: `${(loggedCalories / recommendedCalories) * 100}%`,
                        height: `${(loggedCalories / recommendedCalories) * 100}%`
                    }}></div>
                </div>
                <div className="logged-text">Logged: {loggedCalories} / {recommendedCalories} kcal</div>
                <div className="macro-nutrients-pie-chart">
                    <Pie data={BreakfastData} />
                </div>
            </div>
            <div className="box breakfast-macro-nutrients-bar-chart">
                <h2>{mealType} Nutrition info</h2>
                <Bar data={breakfastBarChartData} options={{ responsive: true }} />
            </div>

            {popupVisible && (
                <div className="popup">
                    <div id="popupContent">
                        <h2>{foodData.name} ({quantity}g)</h2>
                        <p><strong>Calories:</strong> {foodData.calories.toFixed(2)} kcal</p>
                        <p><strong>Carbohydrates:</strong> {foodData.carbs.toFixed(2)} g</p>
                        <p><strong>Proteins:</strong> {foodData.proteins.toFixed(2)} g</p>
                        <p><strong>Fats:</strong> {foodData.fats.toFixed(2)} g</p>
                    </div>
                    <button onClick={saveData}>Log food</button>
                    <button onClick={closePopup}>Close</button>
                </div>
            )}
        </div>
    );
};

export default LogFoodPage;
