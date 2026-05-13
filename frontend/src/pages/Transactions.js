import React, { useEffect, useState } from "react";
import { CreditCard, Search, RefreshCw } from "lucide-react";
import API from "../api";
import "./Transactions.css";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await API.get("/transactions/");
      setTransactions(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    let result = transactions;
    if (statusFilter !== "ALL") {
      result = result.filter((t) => t.status === statusFilter);
    }
    if (search) {
      result = result.filter(
        (t) =>
          t.phone_number.includes(search) ||
          (t.mpesa_reference && t.mpesa_reference.includes(search)),
      );
    }
    setFiltered(result);
  }, [search, statusFilter, transactions]);

  const totalRevenue = transactions
    .filter((t) => t.status === "SUCCESS")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  if (loading) return <div className="loading">Loading transactions...</div>;

  return (
    <div className="transactions-page">
      <div className="page-header">
        <div>
          <h1>Transactions</h1>
          <p>
            {transactions.length} total — KES {totalRevenue.toLocaleString()}{" "}
            collected
          </p>
        </div>
        <button className="btn-refresh" onClick={fetchTransactions}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="filters">
        <div className="search-box">
          <Search size={16} color="rgba(255,255,255,0.3)" />
          <input
            type="text"
            placeholder="Search by phone or M-Pesa ref..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="status-filters">
          {["ALL", "SUCCESS", "PENDING", "FAILED"].map((s) => (
            <button
              key={s}
              className={`filter-btn ${statusFilter === s ? "active" : ""}`}
              onClick={() => setStatusFilter(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="tx-table">
        <div className="tx-header">
          <span>Phone</span>
          <span>Package</span>
          <span>Amount</span>
          <span>M-Pesa Ref</span>
          <span>Date</span>
          <span>Status</span>
        </div>
        {filtered.map((t) => (
          <div className="tx-row" key={t.id}>
            <span className="tx-phone">{t.phone_number}</span>
            <span className="tx-package">Package #{t.package}</span>
            <span className="tx-amount">KES {t.amount}</span>
            <span className="tx-ref">{t.mpesa_reference || "—"}</span>
            <span className="tx-date">
              {new Date(t.created_at).toLocaleString("en-KE", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <span>
              <span className={`status-badge ${t.status.toLowerCase()}`}>
                {t.status}
              </span>
            </span>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="empty-state">
            <CreditCard size={40} color="rgba(255,255,255,0.1)" />
            <p>No transactions found</p>
          </div>
        )}
      </div>
    </div>
  );
}
