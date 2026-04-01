import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";
import "./Search.css";
import { API_BASE_URL } from "../config/api.js";

const CITY_COORDINATES = {
  Hyderabad: { latitude: 17.4213, longitude: 78.3478 },
  Mumbai: { latitude: 19.0759, longitude: 72.8776 },
  Delhi: { latitude: 28.7041, longitude: 77.1025 },
  Bangalore: { latitude: 12.9716, longitude: 77.5946 },
  Kolkata: { latitude: 22.5726, longitude: 88.3639 },
  Chennai: { latitude: 13.0827, longitude: 80.2707 },
  Pune: { latitude: 18.5204, longitude: 73.8567 },
  Jaipur: { latitude: 26.9124, longitude: 75.7873 },
  Lucknow: { latitude: 26.8467, longitude: 80.9462 },
  Ahmedabad: { latitude: 23.0225, longitude: 72.5714 },
};

const cityNames = Object.keys(CITY_COORDINATES);

const FALLBACK_DONORS_BY_CITY = {
  Hyderabad: [
    {
      _id: "fallback-hyd-1",
      name: "Kiran Reddy",
      bloodGroup: "O+",
      contact: "9876543210",
      distanceKm: 0,
      location: { type: "Point", coordinates: [78.3478, 17.4213] },
    },
    {
      _id: "fallback-hyd-2",
      name: "Sowmya Rao",
      bloodGroup: "A+",
      contact: "8765432109",
      distanceKm: 0.27,
      location: { type: "Point", coordinates: [78.35, 17.42] },
    },
  ],
  Mumbai: [
    {
      _id: "fallback-mum-1",
      name: "Aarav Mehta",
      bloodGroup: "O+",
      contact: "9345678901",
      distanceKm: 0,
      location: { type: "Point", coordinates: [72.8776, 19.0759] },
    },
    {
      _id: "fallback-mum-2",
      name: "Ishita Shah",
      bloodGroup: "A+",
      contact: "9456789012",
      distanceKm: 0.6,
      location: { type: "Point", coordinates: [72.88, 19.08] },
    },
  ],
  Delhi: [
    {
      _id: "fallback-del-1",
      name: "Kabir Malhotra",
      bloodGroup: "A+",
      contact: "9789012345",
      distanceKm: 0,
      location: { type: "Point", coordinates: [77.1025, 28.7041] },
    },
    {
      _id: "fallback-del-2",
      name: "Aditi Bansal",
      bloodGroup: "B+",
      contact: "9890123456",
      distanceKm: 0.9,
      location: { type: "Point", coordinates: [77.11, 28.71] },
    },
  ],
  Bangalore: [
    {
      _id: "fallback-ban-1",
      name: "Pranav Shetty",
      bloodGroup: "O+",
      contact: "8123456789",
      distanceKm: 0,
      location: { type: "Point", coordinates: [77.5946, 12.9716] },
    },
  ],
  Kolkata: [
    {
      _id: "fallback-kol-1",
      name: "Anirban Ghosh",
      bloodGroup: "O+",
      contact: "8456789012",
      distanceKm: 0,
      location: { type: "Point", coordinates: [88.3639, 22.5726] },
    },
  ],
  Chennai: [
    {
      _id: "fallback-che-1",
      name: "Arvind Subramani",
      bloodGroup: "B+",
      contact: "8678901234",
      distanceKm: 0,
      location: { type: "Point", coordinates: [80.2707, 13.0827] },
    },
  ],
  Pune: [
    {
      _id: "fallback-pun-1",
      name: "Omkar Jagtap",
      bloodGroup: "A+",
      contact: "8890123456",
      distanceKm: 0,
      location: { type: "Point", coordinates: [73.8567, 18.5204] },
    },
  ],
  Jaipur: [
    {
      _id: "fallback-jai-1",
      name: "Lakshya Rathore",
      bloodGroup: "O+",
      contact: "9123456780",
      distanceKm: 0,
      location: { type: "Point", coordinates: [75.7873, 26.9124] },
    },
  ],
  Lucknow: [
    {
      _id: "fallback-luc-1",
      name: "Aman Srivastava",
      bloodGroup: "A+",
      contact: "8912345670",
      distanceKm: 0,
      location: { type: "Point", coordinates: [80.9462, 26.8467] },
    },
  ],
  Ahmedabad: [
    {
      _id: "fallback-ahm-1",
      name: "Dhruv Trivedi",
      bloodGroup: "B+",
      contact: "8734567892",
      distanceKm: 0,
      location: { type: "Point", coordinates: [72.5714, 23.0225] },
    },
  ],
};

const getFallbackDonors = (city) => {
  return FALLBACK_DONORS_BY_CITY[city] || FALLBACK_DONORS_BY_CITY.Hyderabad;
};

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const donorPinIcon = L.divIcon({
  className: "custom-map-pin donor-pin",
  html: '<span class="pin-core"></span>',
  iconSize: [22, 32],
  iconAnchor: [11, 32],
  popupAnchor: [0, -28],
});

const userPinIcon = L.divIcon({
  className: "custom-map-pin user-pin",
  html: '<span class="pin-core"></span><span class="pin-pulse"></span>',
  iconSize: [26, 38],
  iconAnchor: [13, 38],
  popupAnchor: [0, -34],
});

const RecenterMap = ({ center }) => {
  const map = useMap();

  useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);

  return null;
};

const Search = () => {
  const [bloodGroup, setBloodGroup] = useState("all");
  const [users, setUsers] = useState([]);
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [location, setLocation] = useState({
    latitude: 17.4213,
    longitude: 78.3478,
  });
  const [loading, setLoading] = useState(false);
  const [locationText, setLocationText] = useState(
    "Hyderabad (17.4213, 78.3478)",
  );
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [selectedCity, setSelectedCity] = useState("Hyderabad");

  const bloodGroupOptions = [
    "all",
    "A+",
    "A-",
    "B+",
    "B-",
    "O+",
    "O-",
    "AB+",
    "AB-",
  ];

  const fetchDonors = async (latitude, longitude, city, radius = 10000) => {
    const res = await axios.get(
      `${API_BASE_URL}/api/users/search?bloodGroup=all&latitude=${latitude}&longitude=${longitude}&radius=${radius}`,
    );
    const apiUsers = res.data.users || [];
    return apiUsers.length > 0 ? apiUsers : getFallbackDonors(city);
  };

  // Fetch all users from database on component mount
  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const donors = await fetchDonors(17.4213, 78.3478, "Hyderabad", 50000);
        setUsers(donors);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        setUsers(getFallbackDonors("Hyderabad"));
      }
    };

    fetchAllUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    if (!bloodGroup || bloodGroup === "all") return users;
    return users.filter((user) => user.bloodGroup === bloodGroup);
  }, [users, bloodGroup]);

  const mapCenter = useMemo(() => {
    if (location) return [location.latitude, location.longitude];
    return [17.4213, 78.3478];
  }, [location]);

  const visibleMapUsers = useMemo(
    () => users.filter((user) => user.location?.coordinates?.length === 2),
    [users],
  );

  const handleCitySelect = (city) => {
    const coords = CITY_COORDINATES[city];
    if (coords) {
      setLocation(coords);
      setLocationText(
        `${city} (${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)})`,
      );
      setSelectedCity(city);

      setLoading(true);
      fetchDonors(coords.latitude, coords.longitude, city, 10000)
        .then((donors) => {
          setUsers(donors);
          setNearbyUsers(donors);
          setIsSearchMode(true);
        })
        .catch((error) => {
          console.error("Failed to fetch city donors:", error);
          const fallback = getFallbackDonors(city);
          setUsers(fallback);
          setNearbyUsers(fallback);
          setIsSearchMode(true);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const donors = await fetchDonors(
        location.latitude,
        location.longitude,
        selectedCity,
        10000,
      );
      setNearbyUsers(donors);
      setUsers(donors);
      setIsSearchMode(true);
    } catch (error) {
      console.error(error);
      const fallback = getFallbackDonors(selectedCity);
      setNearbyUsers(fallback);
      setUsers(fallback);
      setIsSearchMode(true);
      alert("Showing fallback donors due to network issue.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewAllDonors = async () => {
    setLoading(true);
    try {
      const donors = await fetchDonors(17.4213, 78.3478, "Hyderabad", 50000);
      setUsers(donors);
      setNearbyUsers([]);
      setIsSearchMode(false);
      setLocation(CITY_COORDINATES.Hyderabad);
      setLocationText("Hyderabad (17.4213, 78.3478)");
      setSelectedCity("Hyderabad");
      setBloodGroup("all");
    } catch (error) {
      console.error("Failed to fetch all users:", error);
      setUsers(getFallbackDonors("Hyderabad"));
      setNearbyUsers([]);
      setIsSearchMode(false);
    } finally {
      setLoading(false);
    }
  };

  const isNearby = (donor) => {
    return nearbyUsers.some((nearbyUser) => nearbyUser._id === donor._id);
  };

  return (
    <section className="dashboard">
      <h1 className="dashboard-title">Find Blood Donors Near You</h1>

      <div className="search-panel">
        <select
          className="city-select"
          value={selectedCity}
          onChange={(e) => handleCitySelect(e.target.value)}
        >
          <option value="">Select a city</option>
          {cityNames.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>

        <select
          className="blood-select"
          value={bloodGroup}
          onChange={(e) => setBloodGroup(e.target.value)}
        >
          {bloodGroupOptions.map((option) => (
            <option key={option} value={option}>
              {option === "all" ? "All Blood Groups" : option}
            </option>
          ))}
        </select>

        <button
          className="btn btn-search"
          onClick={handleSearch}
          disabled={loading}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      <p className="location-text">Current: {locationText}</p>

      <div className="status-bar">
        <span className="status-badge">
          {isSearchMode
            ? `🔍 ${nearbyUsers.length} donors nearby (within 10km) • 📋 Showing all ${filteredUsers.length} donors`
            : `📍 Showing all ${filteredUsers.length} donors`}
        </span>
        {isSearchMode && (
          <button
            className="btn btn-reset"
            onClick={handleViewAllDonors}
            disabled={loading}
          >
            View All Donors
          </button>
        )}
      </div>

      <div className="map-card">
        <h2>All Donors Map 📍</h2>
        <p className="map-subtitle">
          Red pins show all available donors across regions
        </p>
        <div className="map-wrap">
          <MapContainer
            center={mapCenter}
            zoom={13}
            scrollWheelZoom={true}
            className="live-map"
          >
            <RecenterMap center={mapCenter} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {location && (
              <Marker
                position={[location.latitude, location.longitude]}
                icon={userPinIcon}
              >
                <Tooltip
                  permanent
                  direction="top"
                  offset={[0, -28]}
                  className="you-here-label"
                >
                  You are here
                </Tooltip>
                <Popup>You are here</Popup>
              </Marker>
            )}

            {visibleMapUsers.map((user) => {
              const [longitude, latitude] = user.location.coordinates;
              return (
                <Marker
                  key={user._id}
                  position={[latitude, longitude]}
                  icon={donorPinIcon}
                >
                  <Popup>
                    <strong>{user.name}</strong>
                    <br />
                    Blood Group: {user.bloodGroup}
                    <br />
                    Contact: {user.contact || "Not provided"}
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

          <div className="map-legend">
            <span className="legend-dot legend-user" /> You
            <span className="legend-dot legend-donor" /> Donors
            <span className="legend-count">
              Showing {visibleMapUsers.length} donors
            </span>
          </div>
        </div>
      </div>

      <div className="list-card">
        <h2>Donor List</h2>
        <div className="donor-list">
          {filteredUsers.map((user) => (
            <article
              key={user._id}
              className={`donor-item ${isNearby(user) ? "nearby" : ""}`}
            >
              <div className="avatar">{user.name.charAt(0)}</div>
              <div className="donor-meta">
                <p className="donor-name">
                  {user.name}
                  {isNearby(user) && (
                    <span className="nearby-badge">🎯 Nearby</span>
                  )}
                </p>
                <p className="donor-subline">
                  Blood Group: <strong>{user.bloodGroup}</strong>
                  <span className="dot">|</span>
                  Contact: {user.contact || "Not provided"}
                  <span className="dot">|</span>
                  {user.distanceKm} km away
                </p>
              </div>
              {user.contact && (
                <a className="btn btn-contact" href={`tel:${user.contact}`}>
                  Contact
                </a>
              )}
              {!user.contact && (
                <span className="btn btn-contact disabled">No Contact</span>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Search;
