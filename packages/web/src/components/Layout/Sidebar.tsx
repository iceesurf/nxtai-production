import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  UserGroupIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  CpuChipIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../store/authStore';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const menuItems = [
    { 
      path: '/dashboard', 
      icon: HomeIcon, 
      label: 'Dashboard',
      exact: true
    },
    { 
      path: '/dashboard/agents', 
      icon: CpuChipIcon, 
      label: 'Agentes'
    },
    { 
      path: '/dashboard/messages', 
      icon: ChatBubbleLeftRightIcon, 
      label: 'Mensagens'
    },
    { 
      path: '/dashboard/analytics', 
      icon: ChartBarIcon, 
      label: 'Analytics'
    },
    { 
      path: '/dashboard/users', 
      icon: UserGroupIcon, 
      label: 'Usuários',
      requiredRole: ['admin', 'super_admin']
    },
    { 
      path: '/dashboard/dialogflow', 
      icon: ChatBubbleLeftRightIcon, 
      label: 'Dialogflow'
    },
    { 
      path: '/dashboard/settings', 
      icon: Cog6ToothIcon, 
      label: 'Configurações'
    }
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const filteredMenuItems = menuItems.filter(item => {
    if (!item.requiredRole) return true;
    return item.requiredRole.includes(user?.role || '');
  });

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 w-64 h-full bg-gray-800 border-r border-gray-700 transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <BoltIcon className="h-8 w-8 text-blue-500" />
            <span className="text-xl font-bold text-white">NXT.AI</span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              ×
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {filteredMenuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`
              }
            >
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="border-t border-gray-700 p-4">
          <div className="flex items-center mb-4">
            <img
              src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName}`}
              alt="Avatar"
              className="h-10 w-10 rounded-full"
            />
            <div className="ml-3">
              <p className="text-sm font-medium text-white">{user?.displayName}</p>
              <p className="text-xs text-gray-400">{user?.email}</p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-300 rounded-lg hover:bg-red-600 hover:text-white transition-colors duration-200"
          >
            <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
            Sair
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;