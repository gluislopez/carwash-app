import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Car, Settings, DollarSign } from 'lucide-react';

const Layout = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Car, label: 'Servicios', path: '/services' },
    { icon: Users, label: 'Empleados', path: '/employees' },
    { icon: Users, label: 'Clientes', path: '/customers' },
    { icon: DollarSign, label: 'Reportes', path: '/reports' },
    { icon: Settings, label: 'Configuración', path: '/settings' },
  ];

  return (
    <div className="layout">
      <aside className="sidebar">
        <div style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
          <img 
            src="/logo.jpg" 
            alt="Express Carwash" 
            style={{ 
              width: '120px', 
              height: '120px', 
              borderRadius: '50%', 
              objectFit: 'cover',
              marginBottom: '1rem',
              border: '3px solid var(--primary)'
            }} 
          />
          <h1 style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>Express Carwash</h1>
        </div>
        <nav>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="main-content">
        <div className="container">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
