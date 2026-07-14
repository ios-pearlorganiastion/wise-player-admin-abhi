import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlay, FiUsers, FiDollarSign, FiLayers,FiTrendingUp, FiCheckSquare, FiBarChart2, FiUserCheck, FiTag, FiUserPlus, FiSettings, FiLifeBuoy, FiLock, FiLogOut } from 'react-icons/fi';
import { useAuthContext } from '../../contexts/AuthContext';
import { useDashboardStats } from '../../hooks/useDashboard';
import { useSupportTicketsCount } from '../../hooks/useSupportTickets';
import './ColumnFilter.css'; // Reusing some shared styles or we can create Sidebar.css

const Sidebar = ({ activePage, isMobileOpen, onMobileClose }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthContext();
  const { data: stats } = useDashboardStats();
  const { data: openTicketsCount } = useSupportTicketsCount('OPEN');

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
    { id: 'activation-requests', icon: <FiCheckSquare />, path: '/activation-requests', label: 'Activation', showBadge: true, badgeKey: 'pendingActivations' },
    { id: 'reports', icon: <FiBarChart2 />, path: '/reports', label: 'Reports' },
    { id: 'users', icon: <FiUserCheck />, path: '/users', label: 'Users' },
    { id: 'support-tickets', icon: <FiLifeBuoy />, path: '/support-tickets', label: 'Support', showBadge: true, badgeKey: 'openSupportTickets' },
    { id: 'change-password', icon: <FiLock />, path: '/change-password', label: 'Change Password' },
    { id: 'pricing-tiers', icon: <FiLayers />, path: '/pricing-tiers', label: 'Pricing Tiers' },
  ];

  const superAdminItems = [
    { id: 'plans', icon: <FiTag />, path: '/plans', label: 'Plans' },
    { id: 'resellers', icon: <FiUserPlus />, path: '/resellers', label: 'Resellers' },
    { id: 'admin-management', icon: <FiSettings />, path: '/admin-management', label: 'Admins' },
  ];

  const handleNavClick = (path) => {
    navigate(path);
    if (onMobileClose) onMobileClose();
  };

  return (
    <>
      <div 
        className={`sidebar-overlay ${isMobileOpen ? 'visible' : ''}`} 
        onClick={onMobileClose}
      />
      <div className={`glass-sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
        <div className="logo-box">
          <span className="logo-text">WP</span>
          <div className="logo-visualizer">
            <span className="v-bar"></span>
            <span className="v-bar"></span>
            <span className="v-bar"></span>
            <span className="v-bar"></span>
          </div>
        </div>
        <nav className="nav-links">
          {navItems.map((item) => (
            <div 
              key={item.id}
              className={`nav-item ${activePage === item.id ? 'active' : ''}`}
              onClick={() => handleNavClick(item.path)}
              title={item.label}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {item.showBadge && (
                (item.badgeKey === 'openSupportTickets' ? openTicketsCount : stats?.[item.badgeKey]) > 0
              ) && (
                <span className="nav-badge animate-pulse">
                  {item.badgeKey === 'openSupportTickets' ? openTicketsCount : stats?.[item.badgeKey]}
                </span>
              )}
            </div>
          ))}
          
          <div className="sidebar-divider"></div>

          {(user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN') && superAdminItems.map((item) => (
            <div 
              key={item.id}
              className={`nav-item ${activePage === item.id ? 'active' : ''}`}
              onClick={() => handleNavClick(item.path)}
              title={item.label}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </div>
          ))}
          <div className="sidebar-divider"></div>
          
          <div 
            className="nav-item logout-nav-item"
            onClick={logout}
            title="Logout"
          >
            <span className="nav-icon"><FiLogOut /></span>
            <span className="nav-label">Logout</span>
          </div>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
