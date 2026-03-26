import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlay, FiUsers, FiDollarSign, FiTrendingUp, FiCheckSquare, FiBarChart2, FiUserCheck, FiTag, FiUserPlus, FiSettings } from 'react-icons/fi';
import { useAuthContext } from '../../contexts/AuthContext';
import { useDashboardStats } from '../../hooks/useDashboard';
import './ColumnFilter.css'; // Reusing some shared styles or we can create Sidebar.css

const Sidebar = ({ activePage }) => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { data: stats } = useDashboardStats();

  React.useEffect(() => {
    if (stats) {
      console.log('--- Sidebar Debug ---');
      console.log('Stats Keys:', Object.keys(stats));
      console.log('Full Stats Object:', stats);
      console.log('Pending Activations (plural):', stats.pendingActivations);
      console.log('Pending Activation (singular):', stats.pendingActivation);
    }
  }, [stats]);

  const navItems = [
    { id: 'dashboard', icon: <FiPlay />, path: '/dashboard', label: 'Dashboard' },
    { id: 'devices', icon: <FiUsers />, path: '/devices', label: 'Devices' },
    { id: 'payments', icon: <FiDollarSign />, path: '/payments', label: 'Payments' },
    { id: 'subscriptions', icon: <FiTrendingUp />, path: '/subscriptions', label: 'Subscriptions' },
    { id: 'activation-requests', icon: <FiCheckSquare />, path: '/activation-requests', label: 'Activation', showBadge: true },
    { id: 'reports', icon: <FiBarChart2 />, path: '/reports', label: 'Reports' },
    { id: 'users', icon: <FiUserCheck />, path: '/users', label: 'Users' },
  ];

  const superAdminItems = [
    { id: 'plans', icon: <FiTag />, path: '/plans', label: 'Plans' },
    { id: 'resellers', icon: <FiUserPlus />, path: '/resellers', label: 'Resellers' },
    { id: 'admin-management', icon: <FiSettings />, path: '/admin-management', label: 'Admins' },
  ];

  return (
    <div className="glass-sidebar">
      <div className="logo-box">WP</div>
      <nav className="nav-links">
        {navItems.map((item) => (
          <div 
            key={item.id}
            className={`nav-item ${activePage === item.id ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
            title={item.label}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            {item.showBadge && stats?.pendingActivations > 0 && (
              <span className="nav-badge animate-pulse">{stats.pendingActivations}</span>
            )}
          </div>
        ))}
        
        <div className="sidebar-divider"></div>

        {(user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN') && superAdminItems.map((item) => (
          <div 
            key={item.id}
            className={`nav-item ${activePage === item.id ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
            title={item.label}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
