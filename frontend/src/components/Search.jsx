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

const Search = ({ token, user, onAuthError }) => {
  const [bloodGroup, setBloodGroup] = useState("all");
  const [users, setUsers] = useState([]);
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locationText, setLocationText] = useState("Location not selected");
  const [isSearchMode, setIsSearchMode] = useState(false);

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

  // Fetch logged-in user's location from their profile on mount
  useEffect(() => {
    const fetchUserLocation = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const userData = res.data.user;
        if (userData.latitude && userData.longitude) {
          const userLocation = {
            latitude: userData.latitude,
            longitude: userData.longitude,
          };
          setLocation(userLocation);
          setLocationText(
            `${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}`,
          );
        }
      } catch (error) {
        console.error("Failed to fetch user location:", error);
      }
    };

    fetchUserLocation();
  }, [token]);

  // Fetch all users from database on component mount
  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/users/search?bloodGroup=all&latitude=17.4213&longitude=78.3478&radius=50000`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const dbUsers = res.data.users || [];
        setUsers(dbUsers);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        if (error.response?.status === 401 && onAuthError) {
          onAuthError();
          return;
        }
        setUsers([]);
      }
    };

    fetchAllUsers();
  }, [token, onAuthError]);

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

  const getLocation = () => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const currentLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setLocation(currentLocation);
        setLocationText(
          `${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)}`,
        );
        setLoading(false);
      },
      () => {
        setLocationText("Could not fetch your location");
        setLoading(false);
      },
    );
  };

  const handleSearch = async () => {
    if (!location) {
      alert("Please get location first.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:5000/api/users/search?bloodGroup=all&latitude=${location.latitude}&longitude=${location.longitude}&radius=10000`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const apiUsers = res.data.users || [];
      setNearbyUsers(apiUsers);
      setIsSearchMode(true);
    } catch (error) {
      console.error(error);
      if (error.response?.status === 401 && onAuthError) {
        onAuthError();
        return;
      }
      alert("Search failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewAllDonors = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:5000/api/users/search?bloodGroup=all&latitude=17.4213&longitude=78.3478&radius=50000`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const dbUsers = res.data.users || [];
      setUsers(dbUsers);
      setNearbyUsers([]);
      setIsSearchMode(false);
      setLocation(null);
      setLocationText("Location not selected");
      setBloodGroup("all");
    } catch (error) {
      console.error("Failed to fetch all users:", error);
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
        <button
          className="btn btn-location"
          onClick={getLocation}
          disabled={loading}
        >
          {loading ? "Getting Location..." : "Get My Location"}
        </button>

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
