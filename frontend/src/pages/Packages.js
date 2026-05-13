import React, { useEffect, useState } from "react";
import { Package, Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import API from "../api";
import "./Packages.css";

export default function Packages() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", duration_hours: "", price: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchPackages = async () => {
    try {
      const res = await API.get("/packages/");
      setPackages(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await API.post("/packages/", { ...form, is_active: true });
      setForm({ name: "", duration_hours: "", price: "" });
      setShowForm(false);
      fetchPackages();
    } catch (err) {
      setError("Failed to create package. Check all fields.");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (pkg) => {
    try {
      await API.patch(`/packages/${pkg.id}/`, { is_active: !pkg.is_active });
      fetchPackages();
    } catch (err) {
      console.error(err);
    }
  };

  const deletePackage = async (id) => {
    if (!window.confirm("Delete this package?")) return;
    try {
      await API.delete(`/packages/${id}/`);
      fetchPackages();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="loading">Loading packages...</div>;

  return (
    <div className="packages-page">
      <div className="page-header">
        <div>
          <h1>Packages</h1>
          <p>Manage your hotspot packages</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} />
          New Package
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <h2>Create Package</h2>
          {error && <div className="form-error">{error}</div>}
          <form onSubmit={handleSubmit} className="pkg-form">
            <div className="form-row">
              <div className="form-group">
                <label>Package Name</label>
                <input
                  type="text"
                  placeholder="e.g. 1 Hour"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Duration (Hours)</label>
                <input
                  type="number"
                  placeholder="e.g. 1"
                  value={form.duration_hours}
                  onChange={(e) =>
                    setForm({ ...form, duration_hours: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Price (KES)</label>
                <input
                  type="number"
                  placeholder="e.g. 50"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? "Saving..." : "Create Package"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="pkg-grid">
        {packages.map((pkg) => (
          <div
            className={`pkg-card ${!pkg.is_active ? "inactive" : ""}`}
            key={pkg.id}
          >
            <div className="pkg-card-header">
              <Package size={20} color="#00e676" />
              <div className="pkg-actions">
                <button
                  className="icon-btn"
                  onClick={() => toggleActive(pkg)}
                  title="Toggle active"
                >
                  {pkg.is_active ? (
                    <ToggleRight size={20} color="#00e676" />
                  ) : (
                    <ToggleLeft size={20} color="rgba(255,255,255,0.3)" />
                  )}
                </button>
                <button
                  className="icon-btn"
                  onClick={() => deletePackage(pkg.id)}
                  title="Delete"
                >
                  <Trash2 size={16} color="#ff5252" />
                </button>
              </div>
            </div>
            <div className="pkg-name">{pkg.name}</div>
            <div className="pkg-price">KES {pkg.price}</div>
            <div className="pkg-meta">
              <span>
                {pkg.duration_hours} hour{pkg.duration_hours > 1 ? "s" : ""}
              </span>
              <span
                className={`status-dot ${pkg.is_active ? "active" : "inactive"}`}
              >
                {pkg.is_active ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        ))}
        {packages.length === 0 && (
          <div className="empty-state">
            <Package size={40} color="rgba(255,255,255,0.1)" />
            <p>No packages yet. Create your first one.</p>
          </div>
        )}
      </div>
    </div>
  );
}
