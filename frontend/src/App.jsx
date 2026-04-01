import Search from "./components/Search.jsx";
import "./App.css";

function App() {
  return (
    <div className="page-bg">
      <header className="top-bar">
        <div className="brand">
          <span className="brand-drop">🩸</span>
          <div>
            <span className="brand-text">Blood Donor Finder</span>
            <p className="brand-subtext">Public donor search</p>
          </div>
        </div>
      </header>

      <main className="app-main">
        <Search />
      </main>
    </div>
  );
}

export default App;
