import { useEffect, useState } from "react";
import axios from "axios";
import Search from "./components/Search.jsx";
import AuthForm from "./components/AuthForm.jsx";
import "./App.css";

function App() {
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("authToken");
    const savedUser = localStorage.getItem("authUser");

    if (savedToken) {
      setToken(savedToken);
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    }
  }, []);

  const handleLoginSuccess = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
  };

  const handleLogout = async () => {
    try {
      if (token) {
        await axios.post(
          "http://localhost:5000/api/auth/logout",
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
      }
    } catch (_error) {
      // Logout is stateless; always clear local session.
    } finally {
      localStorage.removeItem("authToken");
      localStorage.removeItem("authUser");
      setToken("");
      setUser(null);
    }
  };

  if (!token) {
    return <AuthForm onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="page-bg">
      <header className="top-bar">
        <div className="brand">
          <span className="brand-drop">🩸</span>
          <div>
            <span className="brand-text">Blood Donor Finder</span>
            <p className="brand-subtext">
              Signed in as {user?.email || "admin"}
            </p>
          </div>
        </div>
        <div className="header-actions">
          <button className="logout-btn" type="button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="app-main">
        <Search token={token} user={user} onAuthError={handleLogout} />
      </main>
    </div>
  );
}

export default App;
