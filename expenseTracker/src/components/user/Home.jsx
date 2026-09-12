// Public landing page at "/" with links into login and registration.
import { Link } from "react-router-dom";
import "../styles/Home.css";
import { Footer } from "../layouts/Footer";
import { UserNavbar } from "./UserNavbar";

// Renders the marketing/landing content.
export const Home = () => {
  return (
    <div>
      <UserNavbar></UserNavbar>
      
      <div className="home-container">
        <section className="hero">
          <div className="hero-text">
            <h1>Manage Your Expenses Smartly</h1>
            <p>Track, analyze, and take control of your finances with ease.</p>
            <div className="hero-buttons">
              <Link to="/register" className="btn-primary">Get Started</Link>
              <Link to="/login/user" className="btn-secondary">Login</Link>
            </div>
          </div>
          <div className="hero-image">
            <img src="/images/spare3.jpg" alt="Expense Management" />
          </div>
        </section>

        {/* Features Section */}
        <section className="features">
          <h2>🚀 Why Choose Our Expense Tracker?</h2>
          <div className="feature-list">
            <div className="feature-item">
              <h3>💰 Effortless Tracking</h3>
              <p>Quickly log and categorize your expenses.</p>
            </div>
            <div className="feature-item">
              <h3>📊 Insightful Reports</h3>
              <p>Analyze your spending with detailed charts.</p>
            </div>
            <div className="feature-item">
              <h3>🔔 Smart Spending</h3>
              <p> Set Budgets for the month and receive alerts.</p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="how-it-works">
          <h2>📌 How It Works</h2>
          <div className="steps">
            <div className="step">
              <h3>1️⃣ Sign Up</h3>
              <p>Create an account and set up your finances.</p>
            </div>
            <div className="step">
              <h3>2️⃣ Add Expenses</h3>
              <p>Log transactions with categories and notes.</p>
            </div>
            <div className="step">
              <h3>3️⃣ Analyze & Improve</h3>
              <p>Review your spending and optimize your budget.</p>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};
