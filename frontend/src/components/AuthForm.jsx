import { useState } from "react";
import axios from "axios";
import "./Login.css";

const API_BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000";

const AuthForm = ({ onLoginSuccess }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Login fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Signup fields
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email,
        password,
      });

      const token = res.data.token;
      localStorage.setItem("authToken", token);
      localStorage.setItem("authUser", JSON.stringify(res.data.user));
      onLoginSuccess(token, res.data.user);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/signup`, {
        name,
        email,
        password,
        contact,
        bloodGroup,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      });

      const token = res.data.token;
      localStorage.setItem("authToken", token);
      localStorage.setItem("authUser", JSON.stringify(res.data.user));
      onLoginSuccess(token, res.data.user);
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignup(!isSignup);
    setError("");
    setEmail("");
    setPassword("");
    setName("");
    setContact("");
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {isSignup ? (
          <>
            <h1>Create Account</h1>
            <p>Join Blood Donor Finder & Save Lives</p>

            <form onSubmit={handleSignup} className="login-form">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
              />

              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />

              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
              />

              <label htmlFor="contact">Contact Number</label>
              <input
                id="contact"
                type="tel"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="+91 9876543210"
                required
              />

              <label htmlFor="bloodGroup">Blood Group</label>
              <select
                id="bloodGroup"
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                required
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>

              <div className="location-fields">
                <div>
                  <label htmlFor="latitude">Latitude</label>
                  <input
                    id="latitude"
                    type="number"
                    step="0.0001"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="e.g., 17.4213"
                  />
                </div>
                <div>
                  <label htmlFor="longitude">Longitude</label>
                  <input
                    id="longitude"
                    type="number"
                    step="0.0001"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="e.g., 78.3478"
                  />
                </div>
              </div>
              <p className="location-hint">
                📍 Set your location (Hyderabad default)
              </p>

              {error && <p className="login-error">{error}</p>}

              <button type="submit" disabled={loading}>
                {loading ? "Creating Account..." : "Sign Up"}
              </button>
            </form>

            <p className="toggle-mode">
              Already have an account?{" "}
              <button type="button" onClick={toggleMode} className="toggle-btn">
                Login here
              </button>
            </p>
          </>
        ) : (
          <>
            <h1>Welcome Back</h1>
            <p>Login to continue to Blood Donor Finder</p>

            <form onSubmit={handleLogin} className="login-form">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />

              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />

              {error && <p className="login-error">{error}</p>}

              <button type="submit" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            <p className="toggle-mode">
              Don't have an account?{" "}
              <button type="button" onClick={toggleMode} className="toggle-btn">
                Sign up here
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthForm;
