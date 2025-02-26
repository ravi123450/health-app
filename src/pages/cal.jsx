import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';

const Cali = () => {
  const [caloriesBurned, setCaloriesBurned] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCalories = async () => {
    setLoading(true);
    setError(null); // Reset error before making the request
    try {
      const response = await fetch('http://localhost:5000/get-calories-burned', {
        method: 'GET',
        credentials: 'include', // Ensure cookies are included in the request
        headers: {
          'Authorization': `Bearer ${document.cookie}` // Send the token from the cookie as a Bearer token
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch calories burned');
      }
  
      const data = await response.json();
      setCaloriesBurned(data.caloriesBurned);
    } catch (error) {
      setError(error.message); // Set error message
      console.error('Error fetching calories:', error);
      console.log('Google Access Token:', document.cookie); // Log the cookie content for debugging

    }
    setLoading(false);
  };
  

  const handleLoginSuccess = (response) => {
    console.log('Login successful', response);
    // Optionally, handle the login response here (e.g., send the token to the server)
  };

  const handleLoginError = () => {
    setError('Login failed. Please try again.'); // Show error if login fails
    console.log('Login failed');
  };

  return (
    <div className="App">
      <h1>Google Fit Calories Burned</h1>
      <GoogleLogin
        onSuccess={handleLoginSuccess}
        onError={handleLoginError}
        usePopup={true} // This will open the OAuth flow in a popup
      />
      <button onClick={fetchCalories} disabled={loading}>
        {loading ? 'Loading...' : 'Fetch Calories Burned'}
      </button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {caloriesBurned !== null && !loading && (
        <div>
          <h3>Calories Burned (last 24 hours): {caloriesBurned} kcal</h3>
        </div>
      )}
    </div>
  );
};

export default Cali;
