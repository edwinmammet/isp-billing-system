import React, { useContext } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { LayoutDashboard, Package, CreditCard, Wifi, LogOut } from 'lucide-react';
import './Layout.css';

export default function Layout() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', icon: <LayoutDashboard size={18} />, label: 'Dashboard', end: true },
    { to: '/packages', icon: <Package size={18} />, label: 'Packages' },
    { to: '/transactions', icon: <CreditCard size={18} />, label: 'Transactions' },
    { to: '/hotspot-users', icon: <Wifi size={18} />, label: 'Hotspot Users' },
  ];

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-icon">⚡</span>
          <div>
            <div className="logo-name">HotspotPay</div>
            <div className="logo-sub">Admin Dashboard</div>
          </div>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
