import React, { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Wifi, Package } from "lucide-react";
import API from "../api";
import "./Dashboard.css";

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [hotspotUsers, setHotspotUsers] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [txRes, usersRes, pkgRes] = await Promise.all([
          API.get("/transactions/"),
          API.get("/hotspot-users/"),
          API.get("/packages/"),
        ]);
        setTransactions(txRes.data);
        setHotspotUsers(usersRes.data);
        setPackages(pkgRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const successfulTx = transactions.filter((t) => t.status === "SUCCESS");
  const totalRevenue = successfulTx.reduce(
    (sum, t) => sum + parseFloat(t.amount),
    0,
  );
  const activeUsers = hotspotUsers.filter((u) => u.is_active).length;

  const chartData = (() => {
    const days = {};
    successfulTx.forEach((t) => {
      const date = new Date(t.created_at).toLocaleDateString("en-KE", {
        month: "short",
        day: "numeric",
      });
      days[date] = (days[date] || 0) + parseFloat(t.amount);
    });
    return Object.entries(days)
      .slice(-7)
      .map(([date, revenue]) => ({ date, revenue }));
  })();

  const stats = [
    {
      label: "Total Revenue",
      value: `KES ${totalRevenue.toLocaleString()}`,
      icon: <TrendingUp size={20} />,
      color: "#00e676",
      sub: `${successfulTx.length} successful payments`,
    },
    {
      label: "Active Sessions",
      value: activeUsers,
      icon: <Wifi size={20} />,
      color: "#40c4ff",
      sub: `${hotspotUsers.length} total users`,
    },
    {
      label: "Total Transactions",
      value: transactions.length,
      icon: <TrendingUp size={20} />,
      color: "#ff6d00",
      sub: `${transactions.filter((t) => t.status === "PENDING").length} pending`,
    },
    {
      label: "Active Packages",
      value: packages.length,
      icon: <Package size={20} />,
      color: "#e040fb",
      sub: "Available plans",
    },
  ];

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back — here's what's happening</p>
        </div>
        <div className="live-badge">
          <span className="live-dot"></span>Live
        </div>
      </div>

      <div className="stats-grid">
        {stats.map((stat, i) => (
          <div className="stat-card" key={i} style={{ "--accent": stat.color }}>
            <div className="stat-icon" style={{ color: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
            <div className="stat-sub">{stat.sub}</div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="chart-card">
          <div className="card-header">
            <h2>Revenue (Last 7 Days)</h2>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00e676" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#00e676" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                />
                <XAxis
                  dataKey="date"
                  stroke="rgba(255,255,255,0.3)"
                  tick={{ fontSize: 12 }}
                />
                <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: "#0d150d",
                    border: "1px solid rgba(0,255,100,0.2)",
                    borderRadius: 8,
                  }}
                  labelStyle={{ color: "#fff" }}
                  itemStyle={{ color: "#00e676" }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#00e676"
                  strokeWidth={2}
                  fill="url(#revenueGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-chart">No transaction data yet</div>
          )}
        </div>

        <div className="recent-card">
          <div className="card-header">
            <h2>Recent Transactions</h2>
          </div>
          <div className="recent-list">
            {transactions.slice(0, 6).map((t) => (
              <div className="recent-item" key={t.id}>
                <div className="recent-info">
                  <div className="recent-phone">{t.phone_number}</div>
                  <div className="recent-time">
                    {new Date(t.created_at).toLocaleString("en-KE", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                <div className="recent-right">
                  <div className="recent-amount">KES {t.amount}</div>
                  <span className={`status-badge ${t.status.toLowerCase()}`}>
                    {t.status}
                  </span>
                </div>
              </div>
            ))}
            {transactions.length === 0 && (
              <div className="empty-list">No transactions yet</div>
            )}
          </div>
        </div>
      </div>

      <div className="packages-section">
        <div className="card-header">
          <h2>Package Breakdown</h2>
        </div>
        <div className="packages-grid">
          {packages.map((pkg) => {
            const pkgTx = successfulTx.filter((t) => t.package === pkg.id);
            const pkgRevenue = pkgTx.reduce(
              (sum, t) => sum + parseFloat(t.amount),
              0,
            );
            return (
              <div className="pkg-card" key={pkg.id}>
                <div className="pkg-name">{pkg.name}</div>
                <div className="pkg-duration">{pkg.duration_hours}h</div>
                <div className="pkg-price">KES {pkg.price}</div>
                <div className="pkg-stats">
                  <span>{pkgTx.length} sales</span>
                  <span>KES {pkgRevenue.toLocaleString()}</span>
                </div>
              </div>
            );
          })}
          {packages.length === 0 && (
            <div className="empty-list">No packages yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
