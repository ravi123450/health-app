import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

const services = [
  { id: 1, title: "Service 1", description: "Explain about service 1", image: "service1.png" },
  { id: 2, title: "Service 2", description: "Explain about service 2", image: "service2.png" },
  { id: 3, title: "Service 3", description: "Explain about service 3", image: "service3.png" },
  { id: 4, title: "Service 4", description: "Explain about service 4", image: "service4.png" },
  { id: 5, title: "Service 5", description: "Explain about service 5", image: "service5.png" },
  { id: 6, title: "Service 6", description: "Explain about service 6", image: "service6.png" },
  { id: 7, title: "Service 7", description: "Explain about service 7", image: "service7.png" },
];

const LandingPage = () => {
  const serviceRefs = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.2 }
    );

    serviceRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      serviceRefs.current.forEach((el) => {
        if (el) observer.unobserve(el);
      });
    };
  }, []);

  return (
    <div className="container">
      {/* Navbar */}
      <nav className="navbar">
        <h1 className="logo">Nuvola</h1>
        <div className="nav-links">
          <a href="#">About Us</a>
          <a href="#">Blogs</a>
          <a href="#">Contact Us</a>
          <button className="login-btn" onClick={() => navigate("/login")}>Log in</button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="hero-section">
        <h2>Health is essential for children. Calculate macro nutrients and stay fit.</h2>
        <button className="get-started" onClick={() => navigate("/register")}>
          Get Started
        </button>
      </div>

      {/* Services Section */}
      <div className="services-section">
        <h2>What We Offer</h2>
        <div className="services-container">
          {services.map((service, index) => (
            <div
              key={service.id}
              ref={(el) => (serviceRefs.current[index] = el)}
              className={`service-row ${index % 2 === 0 ? "left" : "right"} fade-in`}
            >
              <div className="service-text-container">
                <p className="service-text">{service.description}</p>
              </div>
              <div className="service-image">
                <img src={service.image} alt={service.title} />
              </div>
              {/* Dotted Lines for Each Service */}
              {index < services.length - 1 && (
                <div className={`dotted-line dotted-${index + 1}`}></div>
              )}
            </div>
          ))}

          {/* Final straight dotted line from Service 7 to Final Destination */}
          <div className="final-straight-line"></div>
        </div>

        {/* Final Destination Image */}
        <div className="final-destination fade-in">
          <img src="destination.png" alt="Final Destination" />
        </div>
      </div>

      {/* Conclusion Section */}
      <div className="flag-section fade-in">
        <h3>By combining all these services, we provide a one-stop health solution.</h3>
      </div>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; 2024 Nuvola - All Rights Reserved</p>
      </footer>
    </div>
  );
};

export default LandingPage;
