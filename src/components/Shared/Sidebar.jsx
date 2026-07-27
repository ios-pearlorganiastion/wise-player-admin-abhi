import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlay, FiUsers, FiDollarSign, FiLayers,FiList, FiTrendingUp, FiCheckSquare, FiBarChart2, FiUserCheck, FiTag, FiUserPlus, FiSettings, FiLifeBuoy, FiLock, FiLogOut, FiX } from 'react-icons/fi';
import { useAuthContext } from '../../contexts/AuthContext';
import { useDashboardStats } from '../../hooks/useDashboard';
import { useSupportTicketsCount } from '../../hooks/useSupportTickets';
import NavItem from '../common/NavItem';
import Button from '../common/Button';
import WisePlayerLogo from '../WisePlayerLogo/WisePlayerLogo';

const Sidebar = ({ activePage, isMobileOpen, onMobileClose }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthContext();
  const { data: stats } = useDashboardStats();
  const { data: openTicketsCount } = useSupportTicketsCount('OPEN');

  const navItems = [
    { id: 'dashboard', icon: <FiPlay />, path: '/dashboard', label: 'Dashboard' },
    { id: 'devices', icon: <FiUsers />, path: '/devices', label: 'Devices' },
    { id: 'playlists', icon: <FiList />, path: '/playlists', label: 'Playlists' },
    { id: 'payments', icon: <FiDollarSign />, path: '/payments', label: 'Payments' },
    { id: 'subscriptions', icon: <FiTrendingUp />, path: '/subscriptions', label: 'Subscriptions' },
    { id: 'activation-requests', icon: <FiCheckSquare />, path: '/activation-requests', label: 'Activation', showBadge: true, badgeKey: 'pendingActivations' },
    { id: 'support-tickets', icon: <FiLifeBuoy />, path: '/support-tickets', label: 'Support', showBadge: true, badgeKey: 'openSupportTickets' },
    
    { id: 'plans', icon: <FiTag />, path: '/plans', label: 'Plans' },
    { id: 'resellers', icon: <FiUserPlus />, path: '/resellers', label: 'Resellers' },
    { id: 'reports', icon: <FiBarChart2 />, path: '/reports', label: 'Reports' },
  ];

  const superAdminItems = [
    { id: 'admin-management', icon: <FiSettings />, path: '/admin-management', label: 'Admins' },
    { id: 'pricing-tiers', icon: <FiLayers />, path: '/pricing-tiers', label: 'Pricing Tiers' },
  ];

  const handleNavClick = (path) => {
    navigate(path);
    if (onMobileClose) onMobileClose();
  };

  const getBadgeValue = (item) => {
    if (!item.showBadge) return 0;
    return item.badgeKey === 'openSupportTickets' ? openTicketsCount : stats?.[item.badgeKey];
  };

  const renderNavList = () => (
    <>
      {navItems.map((item) => (
        <NavItem
          key={item.id}
          icon={item.icon}
          label={item.label}
          active={activePage === item.id}
          badge={getBadgeValue(item)}
          onClick={() => handleNavClick(item.path)}
        />
      ))}
      {user?.role === 'SUPER_ADMIN' && (
        <>
          <div className="h-px bg-line my-2 mx-3" />
          {superAdminItems.map((item) => (
            <NavItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={activePage === item.id}
              onClick={() => handleNavClick(item.path)}
            />
          ))}
        </>
      )}
    </>
  );

  return (
    <>
      {/* Desktop / tablet sidebar */}
      <aside className="hidden md:flex md:w-20 lg:w-64 shrink-0 bg-surface border-r border-line flex-col h-screen sticky top-0">
        <div className="h-16 flex items-center gap-2.5 px-4 lg:px-5 border-b border-line shrink-0 justify-center lg:justify-start">
          <WisePlayerLogo size={30} bg="#141215" />
           <span className="hidden lg:inline font-display font-semibold text-[20px] tracking-wide">
  <span className="text-ink">WISE</span> <span className="text-maroon-light">PLAYER</span>
 </span>
        </div>
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          <div className="hidden lg:block">{renderNavList()}</div>
          {/* Tablet: icon-only rail */}
          <div className="lg:hidden flex flex-col items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                title={item.label}
                onClick={() => handleNavClick(item.path)}
                className={`relative w-11 h-11 flex items-center justify-center rounded-lg transition-colors ${
                  activePage === item.id ? 'bg-surface2 text-maroon-light' : 'text-subtle hover:bg-surface2 hover:text-ink'
                }`}
              >
                {item.icon}
                {getBadgeValue(item) > 0 && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-maroon-light" />
                )}
              </button>
            ))}
            {user?.role === 'SUPER_ADMIN' && (
              <>
                <div className="h-px w-8 bg-line my-1.5" />
                {superAdminItems.map((item) => (
                  <button
                    key={item.id}
                    title={item.label}
                    onClick={() => handleNavClick(item.path)}
                    className={`w-11 h-11 flex items-center justify-center rounded-lg transition-colors ${
                      activePage === item.id ? 'bg-surface2 text-maroon-light' : 'text-subtle hover:bg-surface2 hover:text-ink'
                    }`}
                  >
                    {item.icon}
                  </button>
                ))}
              </>
            )}
          </div>
        </nav>
        <div className="p-2 border-t border-line shrink-0">
          <Button
            variant="ghost"
            onClick={logout}
            title="Logout"
            className="w-full lg:justify-start justify-center gap-3"
          >
            <FiLogOut />
            <span className="hidden lg:inline">Logout</span>
          </Button>
        </div>
      </aside>

      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ${isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/60" onClick={onMobileClose} />
        <aside className={`relative w-72 max-w-[85vw] h-full bg-surface border-r border-line flex flex-col transition-transform duration-300 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="h-16 flex items-center justify-between px-5 border-b border-line shrink-0">
            <div className="flex items-center gap-2.5">
              <WisePlayerLogo size={28} bg="#141215" />
               <span className="font-display font-semibold text-[15px] tracking-wide">
   <span className="text-ink">WISE</span> <span className="text-maroon-light">PLAYER</span>
 </span>
            </div>
            <button onClick={onMobileClose} className="text-subtle w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface2" aria-label="Close menu">
              <FiX />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">{renderNavList()}</nav>
          <div className="p-2 border-t border-line shrink-0">
            <Button variant="ghost" onClick={logout} className="w-full justify-start gap-3">
              <FiLogOut /> Logout
            </Button>
          </div>
        </aside>
      </div>
    </>
  );
};

export default Sidebar;