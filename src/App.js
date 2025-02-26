import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google'; // Import GoogleOAuthProvider

import LandingPage from "./pages/LandingPage";
import RegistrationForm from "./pages/Registration";
import SignIn from "./pages/Signin";
import HomePage from "./pages/Home";
import Goals from "./pages/Goals";
import Progress from "./pages/Progress";
import LogFoodPage from "./pages/logfood/log-food-page";
import Ashu from "./image capture/capture image";
import Cali from "./pages/cal";
import SleepTracker from "./pages/sleep";
import Login from "./pages/login";

import "./App.css";

function App() {
  return (
    // Wrapping your app with GoogleOAuthProvider
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<RegistrationForm />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/log-food" element={<LogFoodPage />} />
          <Route path="/image-cap" element={<Ashu />} />
          <Route path="/cal" element={<Cali />} />
          <Route path="/sleep" element={<SleepTracker />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
