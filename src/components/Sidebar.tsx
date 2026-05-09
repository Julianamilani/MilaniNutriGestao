import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut, Sun, Moon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Sidebar: React.FC = () => {
  const { signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img 
            src="/src/assets/logo-milani.png" 
            alt="MilaniNutri" 
            style={{ width: '40px', height: '40px', objectFit: 'contain' }}
            onError={(e) => {
              // Fallback to text if image not found
              (e.target as HTMLImageElement).style.display = 'none';
              const textLogo = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
              if (textLogo) textLogo.style.display = 'flex';
            }}
          />
          <div className="logo-text">
            MilaniNutri <span style={{ display: 'none' }}>Gestão</span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
        >
          <LayoutDashboard size={20} />
          Dashboard
        </NavLink>
        <NavLink 
          to="/pacientes" 
          className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
        >
          <Users size={20} />
          Pacientes
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button 
          onClick={toggleTheme} 
          className="nav-item" 
          style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '0.5rem', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          {theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}
        </button>
        <button onClick={signOut} className="btn-logout">
          <LogOut size={20} />
          Sair do Sistema
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
