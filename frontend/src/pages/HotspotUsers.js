import React, { useEffect, useState } from "react";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import API from "../api";
import "./HotspotUsers.css";

export default function HotspotUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await API.get("/hotspot-users/");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered =
    filter === "ALL"
      ? users
      : users.filter((u) => (filter === "ACTIVE" ? u.is_active : !u.is_active));
  const activeCount = users.filter((u) => u.is_active).length;

  const getTimeLeft = (expiresAt) => {
    const diff = new Date(expiresAt) - new Date();
    if (diff <= 0) return "Expired";
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    return hours > 0 ? `${hours}h ${mins}m left` : `${mins}m left`;
  };

  if (loading) return <div className="loading">Loading hotspot users...</div>;

  return (
    <div className="hotspot-page">
      <div className="page-header">
        <div>
          <h1>Hotspot Users</h1>
          <p>
            {activeCount} active — {users.length} total
          </p>
        </div>
        <button className="btn-refresh" onClick={fetchUsers}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="filter-tabs">
        {["ALL", "ACTIVE", "EXPIRED"].map((f) => (
          <button
            key={f}
            className={`filter-tab ${filter === f ? "active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f}
            <span className="tab-count">
              {f === "ALL"
                ? users.length
                : f === "ACTIVE"
                  ? activeCount
                  : users.length - activeCount}
            </span>
          </button>
        ))}
      </div>

      <div className="users-grid">
        {filtered.map((user) => (
          <div
            className={`user-card ${!user.is_active ? "expired" : ""}`}
            key={user.id}
          >
            <div className="user-card-header">
              {user.is_active ? (
                <Wifi size={20} color="#00e676" />
              ) : (
                <WifiOff size={20} color="rgba(255,255,255,0.2)" />
              )}
              <span
                className={`user-status ${user.is_active ? "active" : "expired"}`}
              >
                {user.is_active ? "Active" : "Expired"}
              </span>
            </div>
            <div className="user-phone">{user.phone_number}</div>
            <div className="user-credentials">
              <div className="credential">
                <span className="cred-label">Username</span>
                <span className="cred-value">{user.router_username}</span>
              </div>
              <div className="credential">
                <span className="cred-label">Password</span>
                <span className="cred-value">{user.router_password}</span>
              </div>
            </div>
            <div className="user-footer">
              <span className="time-left">{getTimeLeft(user.expires_at)}</span>
              <span className="expires-date">
                {new Date(user.expires_at).toLocaleString("en-KE", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="empty-state">
            <Wifi size={40} color="rgba(255,255,255,0.1)" />
            <p>No users found</p>
          </div>
        )}
      </div>
    </div>
  );
}

